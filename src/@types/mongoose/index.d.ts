import { AggregatePaginateModel } from "mongoose-aggregate-paginate-v2";

declare module "mongoose" {
  interface Model<
    T,
    TQueryHelpers = {},
    TMethods = {},
    TVirtuals = {},
    TStatics = {}
  > extends AggregatePaginateModel<T> {}
}
