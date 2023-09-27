import { Points } from "../../../docs/ixfx/geometry.js";
import { pointsTracker } from "../../../docs/ixfx/data.js";

import * as Things from "./thing.js";
import * as Util from "./util.js";
// GOAL: implement centroid tracker
//       if it hovers over the thing, grap it

const settings = Object.freeze({
  // How often to update Things
  thingUpdateSpeedMs: 10,
  // How many things to spawn
  /*
   CHANGE: originally, it was 10 but now for the sake of simplicity, only 1
   */
  spawnThings: 1,
  hueChange: 0.1,
  pointsTracker: pointsTracker(),
});

/**
 * @typedef {{
 *  things:Things.Thing[]
 *  draggingId: number
 * }} State
 */

/** @type {State} */
let state = Object.freeze({
  things: [],
  // Id of thing being dragged
  draggingId: 0,
  /** @type object */
  centroid: { x: 0, y: 0 },
});

/**
 * Makes use of the data contained in `state`
 */
const use = () => {};

const update = () => {
  // 1. Recalcuate state
  // 2. Save state
  // saveState({ ... });
  // 3. Use it
  use();

  // Loop!
  setTimeout(update, 10);
};

/**
 * Triggered on 'pointerdown' on a 'thing' HTML element
 * @param {Things.Thing} thing
 * @param {PointerEvent} event
 */
const onDragStart = (thing, event) => {
  const { el, id } = thing;

  // Track the id of thing being dragged
  saveState({ draggingId: id });
  el.classList.add(`dragging`);

  // Relative point (to screen) at which drag was started
  const startedAt = Util.relativePoint(event.clientX, event.clientY);

  // Current position of thing
  const thingStartPosition = { ...thing.position };
  // When a pointer move happens
  const pointerMove = (event) => {
    const pointerPosition = Util.relativePoint(event.clientX, event.clientY);
    // Compare relative pointer position to where we started
    // This yields the x,y offset from where dragging started
    const offset = Points.subtract(pointerPosition, startedAt);

    // Add this offset to the thing's original
    // position to get the new position.
    const updatedPosition = Points.sum(thingStartPosition, offset);

    // Update the thing in state.things according to its id
    const finalThing = updateThingInState(id, { position: updatedPosition });
    if (finalThing) {
      // Visually update
      Things.use(finalThing);
    }
  };

  // Dragging...
  document.addEventListener(`pointermove`, pointerMove);

  // Dragging done
  document.addEventListener(
    `pointerup`,
    (event) => {
      el.classList.remove(`dragging`);

      document.removeEventListener(`pointermove`, pointerMove);
      if (state.draggingId === id) {
        saveState({ draggingId: 0 });
      }
    },
    { once: true }
  );
};

const onPointerDown = (event) => {
  findCentroid(event);
  // Return the thing if pointer was on it
  const { things } = state;
  const target = event.target;

  // Find thing with pointer down
  const matching = things.find((thing) => thing.el === target);
  // pointerdown happened on something other than a Thing
  if (matching === undefined) return;

  // Was on a Thing!
  onDragStart(matching, event);
};

const findCentroid = (event) => {
  let { centroid } = state;
  const { pointsTracker } = settings;
  const info = pointsTracker.seen(event.pointerId, { x: event.x, y: event.y });
};

function setup() {
  // Create a bunch of things
  const things = [];
  for (let index = 1; index <= settings.spawnThings; index++) {
    things.push(Things.create(index));
  }

  // Save them
  saveState({ things });

  document.addEventListener(`pointerdown`, onPointerDown);
  // Visualize Pointers
  document.addEventListener(`pointerup`, (event) => {
    const { pointsTracker } = settings;
    console.log(pointsTracker);
    pointsTracker.delete(event.pointerId);
    console.log(pointsTracker);
  });
  // Update things at a fixed rate
  setInterval(() => {
    let { things } = state;

    // Update all the things
    things = things.map((t) => Things.update(t, state));

    // Save updated things into state
    saveState({ things });

    // Visually update based on new state
    for (const thing of things) {
      Things.use(thing);
    }
  }, settings.thingUpdateSpeedMs);

  // Update state of sketch and use state
  // at full speed
  update();
}

setup();

/**
 * Save state
 * @param {Partial<State>} s
 */
function saveState(s) {
  state = Object.freeze({
    ...state,
    ...s,
  });
}

/**
 * Update a given thing by its id. The
 * updated thing is returned,  or _undefined_
 * if it wasn't found.
 * @param {number} thingId
 * @param {Partial<Things.Thing>} updatedThing
 * @returns {Things.Thing|undefined}
 */
function updateThingInState(thingId, updatedThing) {
  let completedThing;

  const things = state.things.map((thing) => {
    // Is it the thing we want to change?
    if (thing.id !== thingId) return thing; // no
    // Return mutated thing
    completedThing = {
      ...thing,
      ...updatedThing,
    };
    return completedThing;
  });

  // Save changed things
  saveState({ things });
  return completedThing;
}
