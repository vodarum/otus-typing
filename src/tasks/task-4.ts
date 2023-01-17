// Есть объединение (юнион) типов заказов в различных состояниях
// и функция filterOnlyInitialAndInWorkOrder которая принимает заказы в любых состояниях
// А возвращает только initial и inWork
// Нужно заменить FIXME на правильный тип вычисленный на основе Order

type Order =
  | {
      state: "initial";
      sum: number;
    }
  | {
      state: "inWork";
      sum: number;
      workerId: number;
    }
  | {
      state: "buyingSupplies";
      sum: number;
      workerId: number;
      suppliesSum: number;
    }
  | {
      state: "producing";
      sum: number;
      workerId: number;
      suppliesSum: number;
      produceEstimate: Date;
    }
  | {
      state: "fullfilled";
      sum: number;
      workerId: number;
      suppliesSum: number;
      produceEstimate: Date;
      fullfillmentDate: Date;
    };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FIXME<T> = T extends { suppliesSum: number } ? null : T; // Способ № 1
// type FIXME = Exclude<Order, { suppliesSum: number }> | null; // Способ № 2
// type FIXME = Extract<Order, { state: "inWork" | "initial" }> | null; // Способ № 3

export const filterOnlyInitialAndInWorkOrder = (order: Order): FIXME<Order> => {
  if (order.state === "initial" || order.state === "inWork") {
    return order;
  }

  return null;
};
