import { AliasedEntity, aliasedSchema, SimpleEntity, simpleSchema } from '../helpers/test-entity-and-schema';

describe("Entity", () => {

  let entityId = 'foo';
  
  describe("without data", () => {

    let entity: SimpleEntity;

    beforeEach(() => entity = new SimpleEntity(simpleSchema.definition, entityId));
  
    it("has the passed in Redis ID", () => expect(entity.entityId).toBe(entityId));
    it("returns null for the number property", () => expect(entity.aNumber).toBeNull());
    it("returns null for the string property", () => expect(entity.aString).toBeNull());
    it("returns null for the boolean property", () => expect(entity.aBoolean).toBeNull());
    it("returns null for the array property", () => expect(entity.anArray).toBeNull());
    it("serializes to the expected JSON", () => expect(JSON.stringify(entity))
      .toBe('{"entityId":"foo","aString":null,"aNumber":null,"aBoolean":null,"anArray":null}'));
  });

  describe("with data", () => {

    let entity: SimpleEntity;

    beforeEach(() => entity = new SimpleEntity(simpleSchema.definition, entityId,
      { aNumber: 42, aString: 'foo', aBoolean: false, anArray: [ "foo", "bar", "baz"] }));

    it("has the passed in Redis ID", () => expect(entity.entityId).toBe(entityId));
    it("returns a number for the number property", () => expect(entity.aNumber).toBe(42));
    it("returns a string for the string property", () => expect(entity.aString).toBe('foo'));
    it("returns a boolean for the boolean property", () => expect(entity.aBoolean).toBe(false));
    it("returns an array for the array property", () => expect(entity.anArray).toEqual([ 'foo', 'bar', 'baz' ]));
    it("serializes to the expected JSON", () => expect(JSON.stringify(entity))
      .toBe('{"entityId":"foo","aString":"foo","aNumber":42,"aBoolean":false,"anArray":["foo","bar","baz"]}'));

    describe("changing the data", () => {
      it("stores a number when the number property is changed", () => {
        entity.aNumber = 13;
        expect(entity.entityData.aNumber).toBe(13);
      });

      it("stores a string when the string property is changed", () => {
        entity.aString = 'bar';
        expect(entity.entityData.aString).toBe('bar');
      });

      it("stores a boolean when the booelan property is changed to true", () => {
        entity.aBoolean = true;
        expect(entity.entityData.aBoolean).toBe(true);
      });

      it("stores a boolean when the booelan property is changed to false", () => {
        entity.aBoolean = false;
        expect(entity.entityData.aBoolean).toBe(false);
      });

      it("stores an array when the array property is changed", () => {
        entity.anArray = [ 'bar', 'baz', 'qux' ];
        expect(entity.entityData.anArray).toEqual([ 'bar', 'baz', 'qux' ]);
      });
    });

    describe("changing to mismatched types", () => {
      it("complains when not a number", () => {
        // @ts-ignore: JavaScript
        expect(() => entity.aNumber = 'foo')
          .toThrow("Property 'aNumber' expected type of 'number' but received type of 'string'.");
        // @ts-ignore: JavaScript
        expect(() => entity.aNumber = true)
          .toThrow("Property 'aNumber' expected type of 'number' but received type of 'boolean'.");
        // @ts-ignore: JavaScript
        expect(() => entity.aNumber = [ ' bar', 'baz', 'qux '])
          .toThrow("Property 'aNumber' expected type of 'number' but received type of 'array'.");
        });
      
      it("complains when not a string", () => {
        // @ts-ignore: JavaScript
        expect(() => entity.aString = true)
          .toThrow("Property 'aString' expected type of 'string' but received type of 'boolean'.");
        // @ts-ignore: JavaScript
        expect(() => entity.aString = 42)
          .toThrow("Property 'aString' expected type of 'string' but received type of 'number'.");
        // @ts-ignore: JavaScript
        expect(() => entity.aString = [ ' bar', 'baz', 'qux '])
          .toThrow("Property 'aString' expected type of 'string' but received type of 'array'.");
      });

      it("complains when not a boolean", () => {
        // @ts-ignore: JavaScript
        expect(() => entity.aBoolean = 'foo')
          .toThrow("Property 'aBoolean' expected type of 'boolean' but received type of 'string'.")
        // @ts-ignore: JavaScript
        expect(() => entity.aBoolean = 42)
          .toThrow("Property 'aBoolean' expected type of 'boolean' but received type of 'number'.")
        // @ts-ignore: JavaScript
        expect(() => entity.aBoolean = [ 'bar', 'baz', 'qux' ])
          .toThrow("Property 'aBoolean' expected type of 'boolean' but received type of 'array'.")
      });
      
      it("complains when not an array", () => {
        // @ts-ignore: JavaScript
        expect(() => entity.anArray = 'foo')
          .toThrow("Property 'anArray' expected type of 'array' but received type of 'string'.")
        // @ts-ignore: JavaScript
        expect(() => entity.anArray = 42)
          .toThrow("Property 'anArray' expected type of 'array' but received type of 'number'.")
        // @ts-ignore: JavaScript
        expect(() => entity.anArray = true)
          .toThrow("Property 'anArray' expected type of 'array' but received type of 'boolean'.")
      });

      it("converts non-string values in arrays to strings", () => {
        // @ts-ignore: JavaScript
        entity.anArray = [ 42, true, 23, false ];
        expect(entity.entityData.anArray).toEqual([ '42', 'true', '23', 'false' ])
      });
    });

    describe("deleting the data", () => {
      it("removes nulled properties", () => {
        entity.aNumber = null;
        entity.aString = null;
        entity.aBoolean = null;
        entity.anArray = null;
        expect(entity.entityData.aNumber).toBeUndefined();
        expect(entity.entityData.aString).toBeUndefined();
        expect(entity.entityData.aBoolean).toBeUndefined();
        expect(entity.entityData.anArray).toBeUndefined();
      });

      it("throws error when setting to undefined", () => {
        expect(() => entity.aNumber = undefined)
          .toThrow("Property 'aNumber' on entity of type 'SimpleEntity' cannot be set to undefined. Use null instead.");

        expect(() => entity.aString = undefined)
          .toThrow("Property 'aString' on entity of type 'SimpleEntity' cannot be set to undefined. Use null instead.");

        expect(() => entity.aBoolean = undefined)
          .toThrow("Property 'aBoolean' on entity of type 'SimpleEntity' cannot be set to undefined. Use null instead.");

        expect(() => entity.anArray = undefined)
          .toThrow("Property 'anArray' on entity of type 'SimpleEntity' cannot be set to undefined. Use null instead.");
      });
    });
  });

  describe("with aliased data", () => {

    let entity: AliasedEntity;

    beforeEach(() => entity = new AliasedEntity(aliasedSchema.definition, entityId,
      { anotherNumber: 23, anotherString: 'bar', anotherBoolean: true, anotherArray: [ "bar", "baz", "qux" ] }));

    it("has the passed in Redis ID", () => expect(entity.entityId).toBe(entityId));
    it("returns a number for the number property", () => expect(entity.aNumber).toBe(23));
    it("returns a string for the string property", () => expect(entity.aString).toBe('bar'));
    it("returns a boolean for the boolean property", () => expect(entity.aBoolean).toBe(true));
    it("returns an array for the array property", () => expect(entity.anArray).toEqual([ 'bar', 'baz', 'qux' ]));
    it("serializes to the expected JSON", () => expect(JSON.stringify(entity))
      .toBe('{"entityId":"foo","aString":"bar","aNumber":23,"aBoolean":true,"anArray":["bar","baz","qux"]}'));

    describe("changing the data", () => {
      it("stores a number when the number property is changed", () => {
        entity.aNumber = 13;
        expect(entity.entityData.anotherNumber).toBe(13);
      });

      it("stores a string when the string property is changed", () => {
        entity.aString = 'baz';
        expect(entity.entityData.anotherString).toBe('baz');
      });

      it("stores a boolean when the booelan property is changed to true", () => {
        entity.aBoolean = true;
        expect(entity.entityData.anotherBoolean).toBe(true);
      });

      it("stores a boolean when the booelan property is changed to false", () => {
        entity.aBoolean = false;
        expect(entity.entityData.anotherBoolean).toBe(false);
      });

      it("stores an array when the array property is changed", () => {
        entity.anArray = [ 'baz', 'qux', 'quux' ];
        expect(entity.entityData.anotherArray).toEqual([ 'baz', 'qux', 'quux' ]);
      });
    });
  
    describe("deleting the data", () => {
      it("removes nulled properties", () => {
        entity.aNumber = null;
        entity.aString = null;
        entity.aBoolean = null;
        entity.anArray = null;
        expect(entity.entityData.anotherNumber).toBeUndefined();
        expect(entity.entityData.anotherString).toBeUndefined();
        expect(entity.entityData.anotherBoolean).toBeUndefined();
        expect(entity.entityData.anotherArray).toBeUndefined();
      });
      
      it("errors when properties are set to undefined", () => {
        expect(() => entity.aNumber = undefined)
          .toThrow("Property 'aNumber' on entity of type 'AliasedEntity' cannot be set to undefined. Use null instead.");

        expect(() => entity.aString = undefined)
          .toThrow("Property 'aString' on entity of type 'AliasedEntity' cannot be set to undefined. Use null instead.");

        expect(() => entity.aBoolean = undefined)
          .toThrow("Property 'aBoolean' on entity of type 'AliasedEntity' cannot be set to undefined. Use null instead.");

        expect(() => entity.anArray = undefined)
          .toThrow("Property 'anArray' on entity of type 'AliasedEntity' cannot be set to undefined. Use null instead.");
      });
    });
  });
});
