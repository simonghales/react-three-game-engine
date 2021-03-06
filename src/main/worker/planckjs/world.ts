import { dynamicBodiesUuids, existingBodies, planckWorld } from './shared';
import {
  handleBeginCollision,
  handleEndCollision,
} from './collisions/collisions';
import { Contact } from 'planck-js';
import {PHYSICS_UPDATE_RATE} from "./config";

let lastUpdate = 0;

export const syncData = (positions: Float32Array, angles: Float32Array) => {
  dynamicBodiesUuids.forEach((uuid, index) => {
    const body = existingBodies.get(uuid);
    if (!body) return;
    const position = body.getPosition();
    const angle = body.getAngle();
    positions[2 * index + 0] = position.x;
    positions[2 * index + 1] = position.y;
    angles[index] = angle;
  });
};

export const stepWorld = () => {
  var now = Date.now();
  var delta = !lastUpdate ? 0 : (now - lastUpdate) / 1000;
  planckWorld.step(PHYSICS_UPDATE_RATE);
  lastUpdate = now;
};

export const initPhysicsListeners = () => {
  planckWorld.on('begin-contact', (contact: Contact) => {
    const fixtureA = contact.getFixtureA();
    const fixtureB = contact.getFixtureB();
    handleBeginCollision(fixtureA, fixtureB);
  });

  planckWorld.on('end-contact', (contact: Contact) => {
    const fixtureA = contact.getFixtureA();
    const fixtureB = contact.getFixtureB();
    handleEndCollision(fixtureA, fixtureB);
  });
};
