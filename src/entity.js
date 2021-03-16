import { Action } from './action';
import { EmbeddedLink } from './embedded-link';
import { Link } from './link';
import * as coerce from './util/coerce';
import {
    isArray,
    isNonNullObject,
    isNullish,
    isRecord,
    isString
} from './util/type-guard';

export * from './action';
export * from './embedded-link';
export * from './link';

export class Entity {
    #actions;
    #class;
    #entities;
    #links;
    #properties;
    #title;

    constructor(options = {}) {
        const {
            actions,
            class: entityClass,
            entities,
            links,
            properties,
            title,
            ...extensions
        } = options ?? {};

        this.actions = actions;
        this.class = entityClass;
        this.entities = entities;
        this.links = links;
        this.properties = properties;
        this.title = title;

        Object.keys(extensions).forEach((key) => {
            this[key] = extensions[key];
        });
    }

    get actions() {
        return this.#actions;
    }

    set actions(value) {
        this.#actions = coerce.toUniqueSubComponents(
            value,
            this.actions,
            Action.isValid,
            Action.of
        );
    }

    get class() {
        return this.#class;
    }

    set class(value) {
        this.#class = coerce.toOptionalStringArray(value, this.class);
    }

    get entities() {
        return this.#entities;
    }

    set entities(value) {
        this.#entities = coerceSubComponents(
            value,
            this.entities,
            SubEntity.isValid,
            SubEntity.of
        );
    }

    get links() {
        return this.#links;
    }

    set links(value) {
        this.#links = coerceSubComponents(
            value,
            this.links,
            Link.isValid,
            Link.of
        );
    }

    get properties() {
        return this.#properties;
    }

    set properties(value) {
        if (isRecord(value)) {
            this.#properties = value;
        } else if (isNullish(value)) {
            this.#properties = undefined;
        }
    }

    get title() {
        return this.#title;
    }

    set title(value) {
        this.#title = coerce.toOptionalString(value, this.title);
    }

    toJSON() {
        const {
            actions,
            class: entityClass,
            entities,
            links,
            properties,
            title,
            ...extensions
        } = this;
        return {
            actions,
            class: entityClass,
            entities,
            links,
            properties,
            title,
            ...extensions
        };
    }
}

function coerceSubComponents(value, defaultValue, validator, factory) {
    if (isArray(value)) {
        return Object.freeze(value.filter(validator).map(factory));
    } else if (isNullish(value)) {
        return undefined;
    } else {
        return defaultValue;
    }
}

export class EmbeddedRepresentation extends Entity {
    #rel;

    constructor(rel, options = {}) {
        super(options);

        if (!isString(rel) && !isArray(rel)) {
            throw new TypeError(
                'EmbeddedRepresentation.rel must be an array of strings'
            );
        }

        this.rel = rel;
    }

    get rel() {
        return this.#rel;
    }

    set rel(value) {
        this.#rel = coerce.toStringArray(value, this.rel);
    }

    static isValid(value) {
        return (
            value instanceof EmbeddedRepresentation ||
            (isNonNullObject(value) && isArray(value.rel))
        );
    }

    static of(value) {
        if (value instanceof EmbeddedRepresentation) {
            return value;
        }
        const { rel, ...rest } = value;
        return new EmbeddedRepresentation(rel, rest);
    }
}

export class SubEntity {
    static isValid(value) {
        return (
            EmbeddedLink.isValid(value) || EmbeddedRepresentation.isValid(value)
        );
    }

    static of(value) {
        if (EmbeddedLink.isValid(value)) {
            return EmbeddedLink.of(value);
        } else {
            return EmbeddedRepresentation.of(value);
        }
    }
}
