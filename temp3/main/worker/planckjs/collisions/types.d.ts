export declare enum FixtureType {
    PLAYER_RANGE = 0,
    MOB = 1
}
export declare type FixtureUserData = {
    uuid: string;
    fixtureIndex: number;
    type: FixtureType;
    [key: string]: any;
};
