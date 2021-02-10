/**
 * Copyright (C) 2020  Dillon Redding
 *
 * See the full notice in the LICENSE file at the top level of the repository.
 */

/**
 * Type alias describing a simple type guard function that accepts some unknown
 * value and determines if it is of type `T`.
 */
export type TypeGuard<T> = (value: unknown) => value is T;

/**
 * Generic `TypeGuard` factory function. Primarily to save typing.
 * @param predicate Determines whether a value is of the desired type
 */
function typeGuard<T>(predicate: (value: unknown) => boolean): TypeGuard<T> {
    return (value): value is T => predicate(value);
}

/**
 * Generates a `TypeGuard` that checks if applying the `typeof` operator to a
 * value matches the given `type`.
 * @param type A result of the `typeof` operator
 */
function typeOfTypeGuard<T>(type: string): TypeGuard<T> {
    return typeGuard(value => typeof value === type);
}

/**
 * Generates a `TypeGuard` that checks if a value is strictly equal to the given
 * value `t`.
 */
function valueTypeGuard<T>(t: T): TypeGuard<T> {
    return typeGuard(value => value === t);
}

export const isNull = valueTypeGuard(null);
export const isUndefined = valueTypeGuard(undefined);
export const isNullOrUndefined =
    typeGuard<null | undefined>(value => isNull(value) || isUndefined(value));

export const isString = typeOfTypeGuard<string>('string');

export const isArray: TypeGuard<unknown[]> = Array.isArray;

export function isTypedArray<T>(value: unknown, elementTypeGuard: TypeGuard<T>): value is T[] {
    return isArray(value) && value.every(elementTypeGuard);
}

export const isStringArray = typeGuard<string[]>(value => isTypedArray(value, isString));

type RecordKey = string | number | symbol;
export type RecordOrArray = Record<RecordKey, unknown> | unknown[];

/**
 * Determines if a value is an object, array, or `null`. That is, the `typeof`
 * operator returns `'object'`.
 */
export const isObject = typeOfTypeGuard<RecordOrArray | null>('object');

/**
 * Similar to `isObject` except is excludes `null`.
 */
export const isNonNullObject = typeGuard<RecordOrArray>(value => isObject(value) && !isNull(value));

/**
 * Determines whether a value is an object and *not* an array or `null`.
 */
export const isRecord = typeGuard<Record<RecordKey, unknown>>(value => isNonNullObject(value) && !isArray(value));