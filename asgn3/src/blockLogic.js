function getTargetBlock(maxDist = 6) {
  let dir = g_camera.at.subtract(g_camera.eye);
  dir = dir.divide(dir.length());

  let pos = g_camera.eye;

  let lastEmpty = null;

  for (let i = 0; i < maxDist * 10; i++) {
    let step = i * 0.1;

    let p = new Vector(
      pos.x + dir.x * step,
      pos.y + dir.y * step,
      pos.z + dir.z * step
    );

    let x = Math.floor(p.x + WORLD_X / 2);
    let y = Math.floor(p.y);
    let z = Math.floor(p.z + WORLD_Z / 2);

    if (!inBounds(x,y,z)) continue;

    if (g_world[x][y][z] === AIR) {
      lastEmpty = { x, y, z };
      continue;
    }

    return {
      hit: { x, y, z },
      place: lastEmpty
    };
  }

  return null; 
}

function digBlock() {
  let res = getTargetBlock();
  if (!res) return;

  g_world[res.hit.x][res.hit.y][res.hit.z] = AIR;
}

function placeBlock(type = DIRT) {
  let res = getTargetBlock();
  if (!res || !res.place) return;

  g_world[res.place.x][res.place.y][res.place.z] = type;
} 
