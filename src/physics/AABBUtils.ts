export interface AABB {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function aabbIntersects(a: AABB, b: AABB): boolean {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

export function resolveOverlap(
  dynamicA: AABB,
  staticB: AABB,
): { x: number; y: number; axis: "x" | "y" } | null {
  const overlapLeft = dynamicA.x + dynamicA.width - staticB.x;
  const overlapRight = staticB.x + staticB.width - dynamicA.x;
  const overlapTop = dynamicA.y + dynamicA.height - staticB.y;
  const overlapBottom = staticB.y + staticB.height - dynamicA.y;

  const minOverlapX = Math.min(overlapLeft, overlapRight);
  const minOverlapY = Math.min(overlapTop, overlapBottom);

  if (minOverlapX <= 0 || minOverlapY <= 0) return null;

  if (minOverlapX < minOverlapY) {
    if (overlapLeft < overlapRight) {
      return { x: -overlapLeft, y: 0, axis: "x" };
    }
    return { x: overlapRight, y: 0, axis: "x" };
  }

  if (overlapTop < overlapBottom) {
    return { x: 0, y: -overlapTop, axis: "y" };
  }
  return { x: 0, y: overlapBottom, axis: "y" };
}

export function centerAABB(x: number, y: number, w: number, h: number): AABB {
  return {
    x: x - w / 2,
    y: y - h / 2,
    width: w,
    height: h,
  };
}
