import { Fixture } from 'planck-js';
import { FixtureUserData } from './types';
export declare const getFixtureData: (fixture: Fixture) => FixtureUserData | null;
export declare const getFixtureUuid: (data: FixtureUserData | null) => string;
export declare const getFixtureIndex: (data: FixtureUserData | null) => number;
export declare const handleBeginCollision: (fixtureA: Fixture, fixtureB: Fixture) => void;
export declare const handleEndCollision: (fixtureA: Fixture, fixtureB: Fixture) => void;
