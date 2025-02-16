import { NavigatorScreenParams } from '@react-navigation/native';

export type TabParamList = {
  HomeTab: undefined;
  CartTab: undefined;
  OrdersTab: undefined;
  ProfileTab: undefined;
};

export type RootStackParamList = {
  Main: NavigatorScreenParams<TabParamList>;
  Product: {
    slug: string;
    name?: string;
  };
  Category: {
    slug: string;
    name?: string;
  };
  Login: undefined;
  Register: undefined;
  Search: {
    initialQuery?: string;
  };
  Order: {
    id: string;
    orderNumber?: string;
  };
  Checkout: undefined;
};

export type IconProps = {
  color: string;
  size: number;
};