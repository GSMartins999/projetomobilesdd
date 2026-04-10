/* eslint-disable @typescript-eslint/no-explicit-any */

const sharedQuery: any = {
    then: jest.fn(function (this: any, onFullfilled: any) {
        return Promise.resolve(this._resolvedValue || []).then(onFullfilled);
    }),
    catch: jest.fn(function (this: any, onRejected: any) {
        return Promise.resolve(this._resolvedValue || []).catch(onRejected);
    }),
    where: jest.fn(function (this: any) { return this; }),
    limit: jest.fn(function (this: any) { return this; }),
    offset: jest.fn(function (this: any) { return this; }),
    orderBy: jest.fn(function (this: any) { return this; }),
    from: jest.fn(function (this: any) { return this; }),
    values: jest.fn(function (this: any) { return this; }),
    set: jest.fn(function (this: any) { return this; }),
    returning: jest.fn(function (this: any) { return this; }),
    _resolvedValue: [],
};

// Helper function to set mock value easily
(sharedQuery as any).mockResolvedValue = function (val: any) {
    this._resolvedValue = val;
    return this;
};

export const mockDb = {
    select: jest.fn(() => sharedQuery),
    insert: jest.fn(() => sharedQuery),
    update: jest.fn(() => sharedQuery),
    delete: jest.fn(() => sharedQuery),
};

describe('mockDb dummy', () => {
    it('should be defined', () => {
        expect(sharedQuery).toBeDefined();
    });
});
