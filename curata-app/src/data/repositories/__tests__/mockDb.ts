/* eslint-disable @typescript-eslint/no-explicit-any */

const sharedQuery: any = {
    then: jest.fn(function (this: any, onFullfilled: any) {
        let val = this._resolvedValue || [];
        if (this._hasOnce) {
            val = this._onceResolvedValue;
            this._hasOnce = false;
        }
        return Promise.resolve(val).then(onFullfilled);
    }),
    catch: jest.fn(function (this: any, onRejected: any) {
        let val = this._resolvedValue || [];
        if (this._hasOnce) {
            val = this._onceResolvedValue;
            this._hasOnce = false;
        }
        return Promise.resolve(val).catch(onRejected);
    }),
    where: jest.fn(function (this: any) { return this; }),
    limit: jest.fn(function (this: any) { return this; }),
    offset: jest.fn(function (this: any) { return this; }),
    orderBy: jest.fn(function (this: any) { return this; }),
    from: jest.fn(function (this: any) { return this; }),
    values: jest.fn(function (this: any) { return this; }),
    set: jest.fn(function (this: any) { return this; }),
    returning: jest.fn(function (this: any) { return this; }),
    _resolvedValue: [] as any[],
    _onceResolvedValue: [] as any[],
    _hasOnce: false,
};

// Helper: define _resolvedValue padrão
(sharedQuery as any).mockResolvedValue = function (val: any) {
    this._resolvedValue = val;
    return this;
};

// Helper: define valor para o PRÓXIMO await
(sharedQuery as any).mockResolvedValueOnce = function (val: any) {
    this._onceResolvedValue = val;
    this._hasOnce = true;
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
