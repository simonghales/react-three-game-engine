import {dynamicBodiesUuids, existingBodies, planckWorld} from "./shared";
import {Shape} from "planck-js/lib/shape";
import {activeCollisionListeners} from "./collisions/data";
import {addCachedBody, getCachedBody} from "./cache";
import type {BodyDef, FixtureOpt, Body, Joint} from "planck-js";
import {Box, Circle, DistanceJoint, RopeJoint, Vec2} from "planck-js";
import {ValidUUID} from "../shared/types";
import {syncBodies} from "../shared";

export enum BodyType {
    static = 'static',
    kinematic = 'kinematic',
    dynamic = 'dynamic'
}

export enum BodyShape {
    box = 'box',
    circle = 'circle',
}

export type FixtureBase = {
    shape: BodyShape,
    fixtureOptions?: Partial<FixtureOpt>,
}

export type BoxFixture = FixtureBase & {
    hx: number,
    hy: number,
    center?: [number, number],
    angle?: number,
}

export const createBoxFixture = ({
                                     width = 1,
                                     height = 1,
                                     center,
                                        angle,
                                     fixtureOptions = {}
                                 }: {
    width?: number,
    height?: number,
    angle?: number,
    center?: [number, number],
    fixtureOptions?: Partial<FixtureOpt>
}): BoxFixture => {
    const fixture: BoxFixture = {
        shape: BodyShape.box,
        hx: width,
        hy: height,
        fixtureOptions,
    }
    if (angle) {
        fixture.angle = angle
    }
    if (center) {
        fixture.center = center
    }
    return fixture
}

export type CircleFixture = FixtureBase & {
    radius: number,
    position?: [number, number],
}

export const createCircleFixture = ({ radius = 1, position, fixtureOptions = {} }: {
    radius?: number,
    position?: [number, number],
    fixtureOptions?: Partial<FixtureOpt>
}): CircleFixture => {
    return {
        shape: BodyShape.circle,
        radius,
        position,
        fixtureOptions,
    }
}

type Fixture = BoxFixture | CircleFixture

type BasicBodyProps = Partial<BodyDef> & {
    fixtures?: Fixture[],
}

type AddBoxBodyProps = BasicBodyProps & {}

type AddCircleBodyProps = BasicBodyProps & {}

export type AddBodyDef = BasicBodyProps | AddBoxBodyProps | AddCircleBodyProps

export type AddBodyProps = AddBodyDef & {
    uuid: ValidUUID,
    listenForCollisions: boolean,
    cacheKey?: string,
    attachToRope?: boolean,
}

export const addBody = ({uuid, cacheKey, listenForCollisions, fixtures = [], attachToRope = false, ...props}: AddBodyProps) => {

    const existingBody = existingBodies.get(uuid)

    if (existingBody) {
        return existingBody
    }

    if (listenForCollisions) {
        activeCollisionListeners[uuid] = true
    }

    const bodyDef: BodyDef = {
        type: BodyType.static,
        fixedRotation: true,
        ...props,
    }

    const {type} = bodyDef

    let body: Body | null = null;

    if (cacheKey) {
        const cachedBody = getCachedBody(cacheKey)
        if (cachedBody) {

            if (fixtures && fixtures.length > 0) {

                let bodyFixture = cachedBody.getFixtureList()

                fixtures.forEach((fixture, fixtureIndex) => {

                    let fixtureOptions = fixture.fixtureOptions

                    fixtureOptions = {
                        userData: {
                            uuid,
                            fixtureIndex,
                            ...fixtureOptions?.userData
                        },
                        ...fixtureOptions,
                    }

                    if (bodyFixture) {

                        if (fixtureOptions) {
                            bodyFixture.setUserData(fixtureOptions.userData)
                        }

                        bodyFixture = bodyFixture.getNext()
                    }

                })

            }

            const {position, angle} = props

            if (position) {
                cachedBody.setPosition(position)
            }

            if (angle) {
                cachedBody.setAngle(angle)
            }

            cachedBody.setActive(true)

            body = cachedBody

        }
    }

    if (!body) {

        body = planckWorld.createBody(bodyDef)

        if (fixtures && fixtures.length > 0) {

            fixtures.forEach((fixture, fixtureIndex) => {

                const {shape} = fixture

                let fixtureOptions = fixture.fixtureOptions ?? {}

                fixtureOptions = {
                    ...fixtureOptions,
                    userData: {
                        uuid,
                        fixtureIndex,
                        ...fixtureOptions?.userData
                    },
                }

                let bodyShape: Shape;

                switch (shape) {
                    case BodyShape.box:
                        const {hx, hy, center} = fixture as BoxFixture
                        bodyShape = Box((hx as number) / 2, (hy as number) / 2, center ? Vec2(center[0], center[1]) : undefined) as unknown as Shape
                        break;
                    case BodyShape.circle:
                        const {radius} = fixture as CircleFixture
                        bodyShape = Circle((radius as number)) as unknown as Shape
                        break;
                    default:
                        throw new Error(`Unhandled body shape ${shape}`)
                }

                if (fixtureOptions) {
                    if (body) {
                        body.createFixture(bodyShape, fixtureOptions as FixtureOpt)
                    }
                } else {
                    if (body) {
                        body.createFixture(bodyShape)
                    }
                }

                // todo - handle rope properly...
                if (attachToRope) {

                    const {position, angle} = props

                    const ropeJointDef = {
                        maxLength: 0.5,
                        localAnchorA: position,
                        localAnchorB: position,
                    };

                    const startingBodyDef: BodyDef = {
                        type: BodyType.static,
                        fixedRotation: true,
                        position,
                        angle,
                    }

                    const startingBody = planckWorld.createBody(startingBodyDef)

                    if (body) {

                        const distanceJoint = DistanceJoint({
                            collideConnected: false,
                            frequencyHz: 5,
                            dampingRatio: 0.5,
                            length: 0.15,
                        }, startingBody, body, position ?? Vec2(0, 0), position ?? Vec2(0, 0))

                        const rope2 = planckWorld.createJoint(RopeJoint(ropeJointDef, startingBody, body, position ?? Vec2(0, 0)) as unknown as Joint);
                        const rope = planckWorld.createJoint(distanceJoint as unknown as Joint);
                    }


                }

            })


        }

    }

    if (type !== BodyType.static) {
        dynamicBodiesUuids.push(uuid)
        syncBodies()
    }

    if (!body) {
        throw new Error(`No body`)
    }

    existingBodies.set(uuid, body)

    return body

}

export type RemoveBodyProps = {
    uuid: ValidUUID,
    cacheKey?: string
}

const tempVec = Vec2(0, 0)

export const removeBody = ({uuid, cacheKey}: RemoveBodyProps) => {
    const index = dynamicBodiesUuids.indexOf(uuid)
    if (index > -1) {
        dynamicBodiesUuids.splice(index, 1)
        syncBodies()
    }
    const body = existingBodies.get(uuid)
    if (!body) {
        console.warn(`Body not found for ${uuid}`)
        return
    }
    existingBodies.delete(uuid)
    if (cacheKey) {
        tempVec.set(-1000, -1000)
        body.setPosition(tempVec)
        tempVec.set(0, 0)
        body.setLinearVelocity(tempVec)
        body.setActive(false)
        addCachedBody(cacheKey, body)
    } else {
        planckWorld.destroyBody(body)
    }
}

export type SetBodyProps = {
    uuid: ValidUUID,
    method: string,
    methodParams: any[],
}

export const setBody = ({uuid, method, methodParams}: SetBodyProps) => {
    const body = existingBodies.get(uuid)
    if (!body) {
        console.warn(`Body not found for ${uuid}`)
        return
    }
    switch (method) {
        //case 'setAngle':
        //    const [angle] = methodParams
        //    body.setTransform(body.getPosition(), angle)
        //    break;
        case 'setLinearVelocity':
            // console.log('methodParams', methodParams[0].x, methodParams[0].y);
            (body as any)[method](...methodParams)
            break;
        default:
            (body as any)[method](...methodParams)
    }
}

export type UpdateBodyData = {
    fixtureUpdate?: {
        groupIndex?: number,
        categoryBits?: number,
        maskBits?: number,
    }
}

export type UpdateBodyProps = {
    uuid: ValidUUID,
    data: UpdateBodyData,
}

export const updateBody = ({uuid, data}: UpdateBodyProps) => {
    const body = existingBodies.get(uuid)
    if (!body) {
        console.warn(`Body not found for ${uuid}`)
        return
    }
    const {fixtureUpdate} = data
    if (fixtureUpdate) {
        const fixture = body.getFixtureList()
        if (fixture) {
            const {
                groupIndex,
                categoryBits,
                maskBits
            } = fixtureUpdate
            if (
                groupIndex !== undefined || categoryBits !== undefined || maskBits !== undefined
            ) {
                const originalGroupIndex = fixture.getFilterGroupIndex()
                const originalCategoryBits = fixture.getFilterCategoryBits()
                const originalMaskBits = fixture.getFilterMaskBits()
                fixture.setFilterData({
                    groupIndex: groupIndex !== undefined ? groupIndex : originalGroupIndex,
                    categoryBits: categoryBits !== undefined ? categoryBits : originalCategoryBits,
                    maskBits: maskBits !== undefined ? maskBits : originalMaskBits,
                })
            }
        }
    }
}
