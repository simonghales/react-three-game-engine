import { FixtureUserData } from './collisions/types';

export type CollisionEventProps = {
  uuid: string;
  fixtureIndex: number;
  collidedFixtureIndex: number;
  isSensor: boolean;
  data: FixtureUserData | null;
};

// todo - store in context...
export const storedPhysicsData: {
  bodies: {
    [uuid: string]: number;
  };
} = {
  bodies: {},
};
