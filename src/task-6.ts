// Задача состоит в том что написать калькулятор для натуральных чисел, но только на типах!
// Ниже приведена заготовка
// Хочется поддержки сложения и вычитания, если хочется еще челленджа, то деление и умножение
// Из-за ограничений глубины вычислений поддержать все натуральные числа не получится, это нормально

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FIXME = 0;

type Increase<A, ACC extends Array<number> = []> = ACC["length"] extends A
  ? [...ACC, 0]["length"]
  : Increase<A, [...ACC, 0]>;

type Decrease<A, ACC extends Array<number> = []> = [
  ...ACC,
  0
]["length"] extends A
  ? ACC["length"]
  : Decrease<A, [...ACC, 0]>;

type Equals<A, B> = A extends B ? (B extends A ? "success" : never) : never;

type Add<A, B> = A extends FIXME ? B : Add<Decrease<A>, Increase<B>>;
type Subtract<A, B> = B extends FIXME ? A : Subtract<Decrease<A>, Decrease<B>>;

export type OnePlusOneTest = Equals<Add<1, 1>, 2>;
export type TwoMinusOneTest = Equals<Subtract<2, 1>, 1>;
