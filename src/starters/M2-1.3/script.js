// #region Settings & state
const settings = Object.freeze({
  /** @type HTMLElement | null */
  horizontals: document.querySelector(`.horizontals`),
  /** @type number */
  defaultSpeed:2
});

let state = Object.freeze({
  /** @type number */
  bottomPos: 0,
  /** @type boolean */
  pointerDown: false,
  /** @type number */
  speed: settings.defaultSpeed
});
// #endregion

const use = () => {
  let {pointerDown} = state;
  if (pointerDown){
  moveForward();
  }
  
};

function setup() {
  document.addEventListener(`pointerdown`, (e)=>{
    switchPointerDownTo(true);
  })
  document.addEventListener(`pointerup`, (e)=>{
    switchPointerDownTo(false);
  })
  // Call every half a second
  setInterval(use, 50);
};

// #region Toolbox
/**
 * Save state
 * @param {Partial<state>} s 
 */
function saveState (s) {
  state = Object.freeze({
    ...state,
    ...s
  });
}
/**
 * Own functions
 */
const moveForward = ()=>{
  const { horizontals } = settings;
  let { speed } = state;
  if (!horizontals) return;
  let {bottomPos} = state;
  bottomPos -= speed;
  saveState({bottomPos});
  horizontals.style.bottom = `${bottomPos}px`;
}
const switchPointerDownTo = (value) =>{
    saveState({pointerDown: value})
}
/**
 * End of own function
 */
setup();
// #endregion