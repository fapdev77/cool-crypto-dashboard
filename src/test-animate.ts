import { animate } from 'motion/react';

const controls = animate(0, 1, {
  duration: 0.5,
  onUpdate: (v) => console.log(v)
});
