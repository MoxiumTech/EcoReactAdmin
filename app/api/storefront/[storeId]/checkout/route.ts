import { NextResponse } from "next/server";
import { getCustomerSession } from "@/lib/auth";
import prismadb from "@/lib/prismadb";
import { Prisma } from "@prisma/client";
import { sendOrderConfirmationEmail } from "@/lib/mail";

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

    const order = await prismadb.$transaction(async (tx) => {
      // Get current cart with all necessary data
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

      // Get all stock items at once
      const stockItems = await tx.stockItem.findMany({
        where: {
          storeId,
          variantId: {
            in: cart.orderItems.map(item => item.variantId)
          }
        }
      });

      const stockItemMap = new Map(
        stockItems.map(item => [item.variantId, item])
      );

      // Validate stock and calculate total
      let orderTotal = 0;
      const stockUpdates: Promise<any>[] = [];
      const stockMovements: Promise<any>[] = [];

      for (const item of cart.orderItems) {
        const stockItem = stockItemMap.get(item.variantId);
        
        if (!stockItem) {
          throw new Error(`Stock item not found for variant ${item.variantId}`);
        }

        const availableStock = stockItem.count - stockItem.reserved;
        if (availableStock < item.quantity) {
          throw new Error(`Insufficient stock for variant ${item.variantId}`);
        }

        orderTotal += Number(item.price) * item.quantity;

        stockUpdates.push(
          tx.stockItem.update({
            where: { id: stockItem.id },
            data: { reserved: { increment: item.quantity } }
          })
        );

        stockMovements.push(
          tx.stockMovement.create({
            data: {
              variantId: item.variantId,
              stockItemId: stockItem.id,
              orderId: cart.id,
              quantity: -item.quantity,
              type: "reserved",
              reason: `Order ${cart.id} - Items reserved for processing`,
              originatorType: "customer",
              originatorId: session.customerId
            }
          })
        );
      }

      // Execute all stock updates in parallel
      await Promise.all([...stockUpdates, ...stockMovements]);

      // Get active promotions
      const customerPromotions = await tx.promotion.findMany({
        where: {
          customers: {
            some: { id: session.customerId }
          },
          storeId,
          isActive: true,
          startDate: { lte: new Date() },
          endDate: { gte: new Date() }
        }
      });

      // Calculate totals
      const orderTotalDecimal = new Decimal(orderTotal);
      const emailDiscountAmount = orderTotalDecimal.mul(new Decimal(emailDiscount || 0).div(100));
      const customerDiscountAmount = orderTotalDecimal.mul(new Decimal(customerDiscount || 0).div(100));
      const couponDiscountAmount = orderTotalDecimal.mul(new Decimal(couponDiscount || 0).div(100));
      const finalTotal = orderTotalDecimal
        .minus(emailDiscountAmount)
        .minus(customerDiscountAmount)
        .minus(couponDiscountAmount);

      // Create order status records
      await tx.orderStatusHistory.create({
        data: {
          orderId: cart.id,
          status: "processing",
          originatorId: session.customerId,
          originatorType: 'customer',
          reason: `Order placed via ${paymentMethod}`
        }
      });

      // Update order
      const updatedOrder = await tx.order.update({
        where: { id: cart.id },
        data: {
          status: "processing",
          isPaid: paymentMethod !== "cash_on_delivery",
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
          customer: true,
          statusHistory: true,
          stockMovements: true
        }
      });

      // Create new cart
      await tx.order.create({
        data: {
          storeId,
          customerId: session.customerId,
          status: "cart",
        }
      });

      return updatedOrder;
    }, {
      timeout: 10000 // 10 second timeout
    });

    // Send order confirmation email
    await sendOrderConfirmationEmail(order);

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
          },
          customer: true
        }
      });

      if (!order) {
        return new NextResponse("Order not found", { status: 404 });
      }

      return NextResponse.json(order);
    }

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
        },
        customer: true
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
