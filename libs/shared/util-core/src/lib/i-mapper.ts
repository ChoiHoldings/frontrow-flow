/* eslint-disable @typescript-eslint/no-explicit-any */
export interface IMapper<T> {
  toDomain?(raw: any): any
  toPersistence?(t: T): any
  toViewModel?(t: T): any
}
