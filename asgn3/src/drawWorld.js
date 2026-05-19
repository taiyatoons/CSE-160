const WORLD_X = 64;
const WORLD_Y = 32;
const WORLD_Z = 64;

let g_world = []; 

function drawWorld() {

    const cube = g_sharedCube;

    const px = Math.floor(g_camera.eye.x + WORLD_X / 2);
    const pz = Math.floor(g_camera.eye.z + WORLD_Z / 2);

    const VIEW_DISTANCE = 64;
    const VIEW_DISTANCE_SQ =
        VIEW_DISTANCE * VIEW_DISTANCE;

    for (let x = 0; x < WORLD_X; x++) {

        for (let y = 0; y < WORLD_Y; y++) {

            for (let z = 0; z < WORLD_Z; z++) {

                const block = g_world[x][y][z];

                if (block === AIR)
                    continue;

                // skip hidden blocks
                if (isBlockHidden(x, y, z))
                    continue;

                // distance culling
                const dx = x - px;
                const dz = z - pz;

                if (
                    dx * dx + dz * dz >
                    VIEW_DISTANCE_SQ
                ) {
                    continue;
                }

                cube.textureNum =
                    blockToTexture(block);

                cube.useTexture = true;

                cube.matrix.setIdentity();

                cube.matrix.translate(
                    x - WORLD_X / 2,
                    y - 1,
                    z - WORLD_Z / 2
                );

                cube.render();
            }
        }
    }
}

// for random world generation 
function generateWorld() {

  g_world = new Array(WORLD_X);

  const SURFACE_HEIGHT = 18;
  const DIRT_DEPTH = 6;

  for (let x = 0; x < WORLD_X; x++) {
    g_world[x] = new Array(WORLD_Y);

    for (let y = 0; y < WORLD_Y; y++) {
      g_world[x][y] = new Array(WORLD_Z);

      for (let z = 0; z < WORLD_Z; z++) {

        let height = SURFACE_HEIGHT;

        if (y > height) {
          g_world[x][y][z] = AIR;
        }
        else if (y === height) {
          g_world[x][y][z] = GRASS;
        }
        else if (y > height - DIRT_DEPTH) {
          g_world[x][y][z] = DIRT;
        }
        else {
          g_world[x][y][z] = STONE;
        }
      }
    }
  }

}


function placeStructure(structure, startX, startY, startZ, blockType = FOSSIL) {

  let placed = 0;
  let skipped = 0;

  for (const block of structure) {

    const x = startX + block[0];
    const y = startY + block[1];
    const z = startZ + block[2];

    if (!inBounds(x, y, z)) {
      skipped++;
      continue;
    }

    if (
      g_world[x][y][z] === STONE ||
      g_world[x][y][z] === DIRT
    ) {
      g_world[x][y][z] = blockType;
      placed++;
    }
  }

  console.log("Structure placed:", placed, "Skipped:", skipped);
}

function carveCave(cx, cy, cz, radius) {

  radius = 3 + Math.random() * 5;  

  for (let x = -radius; x <= radius; x++) {
    for (let y = -radius; y <= radius; y++) {
      for (let z = -radius; z <= radius; z++) {

        let nx = Math.floor(cx + x);
        let ny = Math.floor(cy + y);
        let nz = Math.floor(cz + z);

        if (!inBounds(nx, ny, nz)) continue;

        let dist = Math.sqrt(x * x + y * y + z * z);

        if (dist < radius) {
          g_world[nx][ny][nz] = AIR;
        }
      }
    }
  }
}

function isAir(x, y, z) {

  if (
    x < 0 || x >= WORLD_X ||
    y < 0 || y >= WORLD_Y ||
    z < 0 || z >= WORLD_Z
  ) {
    return true;
  }

  return g_world[x][y][z] === AIR;
} 

function isBlockHidden(x, y, z) {

  return (
    !isAir(x + 1, y, z) &&
    !isAir(x - 1, y, z) &&
    !isAir(x, y + 1, z) &&
    !isAir(x, y - 1, z) &&
    !isAir(x, y, z + 1) &&
    !isAir(x, y, z - 1)
  );
}

function assertWorld() {
  if (!g_world || !g_world[0] || !g_world[0][0]) {
    console.error("World not initialized correctly");
  }
} 

function inBounds(x,y,z) {
  return (
    x >= 0 && x < WORLD_X &&
    y >= 0 && y < WORLD_Y &&
    z >= 0 && z < WORLD_Z
  );
}

// dino logic 
function getStructureBounds(structure) {
  let minY = Infinity, maxY = -Infinity;

  for (const b of structure) {
    minY = Math.min(minY, b[1]);
    maxY = Math.max(maxY, b[1]);
  }

  return {
    minY,
    maxY,
    height: maxY - minY
  };
}

function getGroundY(x, z) {
  for (let y = WORLD_Y - 1; y >= 0; y--) {
    if (g_world[x][y][z] !== AIR) {
      // ensure it's actually surface (air above it)
      if (y === WORLD_Y - 1 || g_world[x][y + 1][z] === AIR) {
        return y;
      }
    }
  }
  return 0;
}

function getStructureXZBounds(structure) {
  let minX = Infinity, maxX = -Infinity;
  let minZ = Infinity, maxZ = -Infinity;

  for (const b of structure) {
    minX = Math.min(minX, b[0]);
    maxX = Math.max(maxX, b[0]);
    minZ = Math.min(minZ, b[2]);
    maxZ = Math.max(maxZ, b[2]);
  }

  return {
    width: maxX - minX,
    depth: maxZ - minZ
  };
}

async function loadDinoStructures() {

    const files = [
        "dinos/stego.json",
        "dinos/bronchiosaurus.json",
        "dinos/crescenthorn.json"
    ];

    for (const file of files) {

        const response = await fetch(file);

        const data = normalizeStructure(await response.json());
        g_dinoStructures.push(data);
    }

    console.log("Loaded dinos:",
        g_dinoStructures);
} 

function normalizeStructure(structure) {

    let minX = Infinity;
    let minY = Infinity;
    let minZ = Infinity;

    for (const b of structure) {

        minX = Math.min(minX, b[0]);
        minY = Math.min(minY, b[1]);
        minZ = Math.min(minZ, b[2]);
    }

    return structure.map(b => [
        b[0] - minX,
        b[1] - minY,
        b[2] - minZ
    ]);
} 