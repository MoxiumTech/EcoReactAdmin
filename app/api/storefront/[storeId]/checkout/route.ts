import { NextResponse } from "next/server";
import { getCustomerSession } from "@/lib/auth";
import prismadb from "@/lib/prismadb";
import { Prisma } from "@prisma/client";
const Decimal = Prisma.Decimal;

export async function POST(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const session = await getCustomerSession();
    const storeId = params.storeId;
    const { 
      paymentMethod,
      phone,
      address,
      city,
      state,
      postalCode,
      country,
      emailDiscount,
      customerDiscount,
      couponDiscount
    } = await req.json();

    if (!storeId) {
      return new NextResponse("Store ID is required", { status: 400 });
    }

    if (!session?.customerId || session.storeId !== storeId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!paymentMethod || !phone || !address || !city || !state || !postalCode || !country) {
      return new NextResponse("All shipping details are required", { status: 400 });
    }

    // Start a transaction to ensure data consistency
    const order = await prismadb.$transaction(async (tx) => {
      // Get current cart
      const cart = await tx.order.findFirst({
        where: {
          storeId,
          customerId: session.customerId,
          status: "cart",
        },
        include: {
          orderItems: {
            include: {
              variant: {
                include: {
                  product: true
                }
              }
            }
          },
          customer: true
        }
      });

      if (!cart || cart.orderItems.length === 0) {
        throw new Error("Cart is empty");
      }

      // Check stock availability and reserve stock
      let orderTotal = 0;
      for (const item of cart.orderItems) {
        const stockItem = await tx.stockItem.findUnique({
          where: {
            variantId_storeId: {
              variantId: item.variantId,
              storeId
            }
          }
        });

        if (!stockItem) {
          throw new Error(`Stock item not found for variant ${item.variantId}`);
        }

        const availableStock = stockItem.count - stockItem.reserved;
        if (availableStock < item.quantity) {
          throw new Error(`Insufficient stock for variant ${item.variantId}`);
        }

        orderTotal += Number(item.price) * item.quantity;

        // Create reservation
        await tx.stockItem.update({
          where: {
            id: stockItem.id
          },
          data: {
            reserved: {
              increment: item.quantity
            }
          }
        });

        // Create stock movement for order placement
        await tx.stockMovement.create({
          data: {
            variantId: item.variantId,
            stockItemId: stockItem.id,
            orderId: cart.id,
            quantity: -item.quantity, // Negative to show stock being taken from available inventory
            type: "reserved",
            reason: `Order ${cart.id} - Items reserved for processing`,
            originatorType: "customer",
            originatorId: session.customerId
          }
        });
      }

      // Get active customer promotions
      const customerPromotions = await tx.promotion.findMany({
        where: {
          customers: {
            some: {
              id: session.customerId
            }
          },
          storeId,
          isActive: true,
          startDate: {
            lte: new Date()
          },
          endDate: {
            gte: new Date()
          }
        }
      });

      // Calculate order total and individual discounts
      const orderTotalDecimal = new Decimal(orderTotal);
      
      // Convert percentage discounts to decimals
      const emailDiscountDecimal = new Decimal(emailDiscount || 0).div(100);
      const customerDiscountDecimal = new Decimal(customerDiscount || 0).div(100);
      const couponDiscountDecimal = new Decimal(couponDiscount || 0).div(100);
      
      // Calculate discount amounts
      const emailDiscountAmount = orderTotalDecimal.mul(emailDiscountDecimal);
      const customerDiscountAmount = orderTotalDecimal.mul(customerDiscountDecimal);
      const couponDiscountAmount = orderTotalDecimal.mul(couponDiscountDecimal);
      
      // Calculate final amount
      const totalDiscountAmount = emailDiscountAmount
        .plus(customerDiscountAmount)
        .plus(couponDiscountAmount);
      const finalTotal = orderTotalDecimal.minus(totalDiscountAmount);

      // Create initial order status records
      await tx.orderStatusHistory.createMany({
        data: [
          {
            orderId: cart.id,
            status: "cart",
            originatorId: session.customerId,
            originatorType: 'customer',
            reason: "Order created in cart"
          },
          {
            orderId: cart.id,
            status: "processing",
            originatorId: session.customerId,
            originatorType: 'customer',
            reason: "Order placed successfully and payment received"
          }
        ]
      });

      // Update all order details in a single operation
      const updatedOrder = await tx.order.update({
        where: { id: cart.id },
        data: {
          status: "processing",
          isPaid: true,
          phone,
          address: `${address}, ${city}, ${state} ${postalCode}, ${country}`,
          promotions: {
            connect: customerPromotions.map(p => ({ id: p.id }))
          },
          totalAmount: orderTotalDecimal,
          finalAmount: finalTotal,
          emailDiscount: new Decimal(emailDiscount || 0),
          customerDiscount: new Decimal(customerDiscount || 0),
          couponDiscount: new Decimal(couponDiscount || 0)
        },
        include: {
          orderItems: {
            include: {
              variant: {
                include: {
                  product: true
                }
              }
            }
          },
          statusHistory: {
            orderBy: {
              createdAt: 'desc'
            }
          },
          stockMovements: {
            orderBy: {
              createdAt: 'desc'
            }
          }
        }
      });

      // Create a new cart for the customer
      await tx.order.create({
        data: {
          storeId,
          customerId: session.customerId,
          status: "cart",
        }
      });

      return updatedOrder;
    });

    return NextResponse.json(order);
  } catch (error) {
    if (error instanceof Error && error.message === "Cart is empty") {
      return new NextResponse("Cart is empty", { status: 400 });
    }
    console.log('[CHECKOUT_ERROR]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function GET(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const session = await getCustomerSession();
    const storeId = params.storeId;
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('orderId');

    if (!storeId) {
      return new NextResponse("Store ID is required", { status: 400 });
    }

    if (!session?.customerId || session.storeId !== storeId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // If orderId is provided, return specific order details
    if (orderId) {
      const order = await prismadb.order.findFirst({
        where: {
          id: orderId,
          storeId,
          customerId: session.customerId,
        },
        include: {
          orderItems: {
            include: {
              variant: {
                include: {
                  product: true,
                  images: true
                }
              }
            }
          }
        }
      });

      if (!order) {
        return new NextResponse("Order not found", { status: 404 });
      }

      return NextResponse.json([order]);
    }

    // Otherwise return all orders except cart
    const orders = await prismadb.order.findMany({
      where: {
        storeId,
        customerId: session.customerId,
        status: {
          not: "cart"
        }
      },
      include: {
        orderItems: {
          include: {
            variant: {
              include: {
                product: true,
                images: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.log('[ORDERS_GET]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
