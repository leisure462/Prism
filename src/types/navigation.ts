export type RootStackParamList = {
  Bookshelf: undefined;
  Reader: { bookId: string };
  Settings: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
