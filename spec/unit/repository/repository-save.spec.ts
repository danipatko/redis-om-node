import { mocked } from 'ts-jest/utils';

import Client from '../../../lib/client';
import Repository from '../../../lib/repository/repository';
import { JsonRepository, HashRepository } from '../../../lib/repository/repository';

import {
  AN_ARRAY, AN_ARRAY_JOINED,
  A_DATE, A_DATE_EPOCH, A_DATE_EPOCH_STRING,
  A_GEOPOINT, A_GEOPOINT_STRING } from '../helpers/test-data';

import { simpleHashSchema, SimpleHashEntity, SimpleJsonEntity, simpleJsonSchema } from '../helpers/test-entity-and-schema';

jest.mock('../../../lib/client');


beforeEach(() => mocked(Client).mockReset());

describe("Repository", () => {

  let client: Client;
  let entityId: string;
  let expectedKey: string;

  describe("#save", () => {

    beforeAll(() => client = new Client());

    describe("to a hash", () => {

      let repository: Repository<SimpleHashEntity>;
      let entity: SimpleHashEntity;

      beforeAll(async () => repository = new HashRepository(simpleHashSchema, client));
      beforeEach(async () => entity = repository.createEntity());

      describe.each([

        ["when saving a fully populated entity", {
          providedString: 'foo', providedNumber: 42, providedBoolean: false,
          providedGeoPoint: A_GEOPOINT, providedDate: A_DATE, providedArray: AN_ARRAY,
          expectedData: { aString: 'foo', aNumber: '42', aBoolean: '0',
            aGeoPoint: A_GEOPOINT_STRING, aDate: A_DATE_EPOCH_STRING, anArray: AN_ARRAY_JOINED }
        }],
  
        [ "when saving a partially populated entity", {
          providedString: 'foo', providedNumber: 42, providedBoolean: null,
          providedGeoPoint: null, providedDate: null, providedArray: null,
          expectedData: { aString: 'foo', aNumber: '42' }
        }]
  
      ])("%s", (_, data) => {
  
        beforeEach(async () => {
          entity.aString = data.providedString;
          entity.aNumber = data.providedNumber;
          entity.aBoolean = data.providedBoolean;
          entity.aGeoPoint = data.providedGeoPoint;
          entity.aDate = data.providedDate;
          entity.anArray = data.providedArray;
          entityId = await repository.save(entity);
          expectedKey = `SimpleHashEntity:${entityId}`;
        });
  
        it("returns the entity id", () => expect(entityId).toBe(entity.entityId));
        it("saves the entity data to the key", () =>
          expect(Client.prototype.hsetall).toHaveBeenCalledWith(expectedKey, data.expectedData));
      });
  
      describe("when saving an empty entity", () => {
        beforeEach(async () => {
          entity.aString = null;
          entity.aNumber = null;
          entity.aBoolean = null;
          entity.aGeoPoint = null;
          entity.aDate = null;
          entity.anArray = null;
          entityId = await repository.save(entity);
          expectedKey = `SimpleHashEntity:${entityId}`;
        });
  
        it("returns the entity id", () => expect(entityId).toBe(entity.entityId));
        it("unlinks the key", () =>
          expect(Client.prototype.unlink).toHaveBeenCalledWith(expectedKey));
      });
    });

    describe("to JSON", () => {

      let repository: Repository<SimpleJsonEntity>;
      let entity: SimpleJsonEntity;

      beforeAll(async () => repository = new JsonRepository(simpleJsonSchema, client));
      beforeEach(async () => entity = repository.createEntity());

      describe.each([

        ["when saving a fully populated entity", {
          providedString: 'foo', providedNumber: 42, providedBoolean: false,
          providedGeoPoint: A_GEOPOINT, providedDate: A_DATE, providedArray: AN_ARRAY,
          expectedData: { aString: 'foo', aNumber: 42, aBoolean: false,
            aGeoPoint: A_GEOPOINT_STRING, aDate: A_DATE_EPOCH, anArray: AN_ARRAY }
        }],
  
        [ "when saving a partially populated entity", {
          providedString: 'foo', providedNumber: 42, providedBoolean: null,
          providedGeoPoint: null, providedDate: null, providedArray: null,
          expectedData: { aString: 'foo', aNumber: 42 }
        }]

      ])("%s", (_, data) => {
  
        beforeEach(async () => {
          entity.aString = data.providedString;
          entity.aNumber = data.providedNumber;
          entity.aBoolean = data.providedBoolean;
          entity.aGeoPoint = data.providedGeoPoint
          entity.aDate = data.providedDate;
          entity.anArray = data.providedArray;
          entityId = await repository.save(entity);
          expectedKey = `SimpleJsonEntity:${entityId}`;
        });
  
        it("returns the entity id", () => expect(entityId).toBe(entity.entityId));
        it("saves the entity data to the key", () =>
          expect(Client.prototype.jsonset).toHaveBeenCalledWith(expectedKey, data.expectedData));
      });

      describe("when saving an empty entity", () => {
        beforeEach(async () => {
          entity.aString = null;
          entity.aNumber = null;
          entity.aBoolean = null;
          entity.aGeoPoint = null;
          entity.aDate = null;
          entity.anArray = null;
          entityId = await repository.save(entity);
          expectedKey = `SimpleJsonEntity:${entityId}`;
        });
  
        it("returns the entity id", () => expect(entityId).toBe(entity.entityId));
        it("unlinks the key", () =>
          expect(Client.prototype.unlink).toHaveBeenCalledWith(expectedKey));
      });
    });
  });
});
