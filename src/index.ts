import { BodyApi, useBody, useBodyApi } from './main/hooks/useBody';
import { Engine } from './main/Engine';
import { Engine as NewEngine } from './engine/Engine'
import { logicWorkerHandler } from './logic/workerHelper';
import { useSendSyncComponentMessage } from './logic/logicWorkerApp/hooks/messaging';
import { withLogicWrapper } from './logic/ApiWrapper';
import { useSyncWithMainComponent } from './logic/logicWorkerApp/hooks/sync';
import { useFixedUpdate } from './shared/PhysicsSync';
import {
  useSubscribeMesh,
} from './shared/MeshSubscriptions';
import { BodyShape, BodyType, createBoxFixture, createCircleFixture } from './main/worker/planckjs/bodies';
import {useStoredMesh, useStoreMesh } from './main/MeshRefs';
import { useOnMessage } from './shared/Messages';
import { useSendMessage } from './shared/SendMessages';
import { Body, BodySync } from "./main/Body";
import {
  useAddInstance,
  useInstancedMesh,
  Instance,
  InstancedMesh,
  InstancesProvider,
} from "./main/InstancesProvider"
import { physicsWorkerHandler } from './main/worker/physicsWorkerHelper';
import { useCollisionEvents } from './main/hooks/useCollisionEvents';
import Physics from './physics/Physics';
import { usePhysicsWorld } from './physics/Physics.context';
import { useAddBody } from './physics/hooks/useAddBody';
import {useBodyApi as useBodyApiNew} from './physics/consumer/hooks/useBodyApi'
import { useSyncObject } from './physics/consumer/hooks/useSyncObject';
import { workerHandler } from './genericWorker/workerHelper';
import PhysicsConsumer from './physics/consumer/PhysicsConsumer';
import { withWorkerWrapper } from './genericWorker/WorkerWrapper';
import { useOnFixedUpdate } from './physics/consumer/PhysicsConsumerHandler.context';

export {
  NewEngine,
  useAddBody,
  useBodyApiNew,
  useSyncObject,
  workerHandler,
  Physics,
  usePhysicsWorld,
  PhysicsConsumer,
  withWorkerWrapper,
  useOnFixedUpdate,
  // old
  Engine,
  useCollisionEvents,
  useBodyApi,
  useBody,
  BodyApi,
  logicWorkerHandler,
  useSendSyncComponentMessage,
  useSyncWithMainComponent,
  useFixedUpdate,
  useSubscribeMesh,
  withLogicWrapper,
  BodyShape,
  BodyType,
  useStoreMesh,
  useStoredMesh,
  useOnMessage,
  useSendMessage,
  createBoxFixture,
  createCircleFixture,
  Body,
  BodySync,
  useAddInstance,
  useInstancedMesh,
  Instance,
  InstancedMesh,
  InstancesProvider,
  physicsWorkerHandler,
};
