"""Builds the hero 3D model: a loaded competition barbell on two stands over a lifting platform.

Run headless (no Blender window needed):
    blender --background --factory-startup --python tools/blender/barbell.py -- <glb_out> <png_out>

Outputs a single-mesh GLB for Three.js and a transparent PNG render used as the phone fallback.
Then compress for the web (Three.js loads it with the meshopt decoder):
    npx @gltf-transform/cli optimize <glb_out> assets/models/barbell.glb --compress meshopt --texture-compress false --simplify false
and convert the PNG, keeping only the bottom 1120×504 that the web viewer shows:
    ffmpeg -i <png_out> -vf "crop=1120:504:0:ih-504,scale=640:288" -c:v libwebp -pix_fmt yuva420p -quality 80 assets/img/barbell.webp
Sizes are real-world metres; plate diameters and colours follow competition (IPF) plates.
"""

import math
import sys

import bpy
from mathutils import Vector

argv = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else []
GLB_OUT = argv[0] if len(argv) > 0 else "barbell.glb"
PNG_OUT = argv[1] if len(argv) > 1 else "barbell.png"

SEGMENTS = 40  # round enough on screen, still light for the web
BAR_HEIGHT = 0.30  # bar centre above the platform top

# ---------- Scene reset ----------

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene


def material(name, color, metallic=0.0, roughness=0.5):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    bsdf = next(n for n in mat.node_tree.nodes if n.type == "BSDF_PRINCIPLED")
    bsdf.inputs["Base Color"].default_value = (*color, 1.0)
    bsdf.inputs["Metallic"].default_value = metallic
    bsdf.inputs["Roughness"].default_value = roughness
    return mat


def srgb(hex_color):
    """'#c8322b' → linear RGB tuple (Blender colours are linear)."""
    hex_color = hex_color.lstrip("#")
    channels = [int(hex_color[i : i + 2], 16) / 255 for i in (0, 2, 4)]
    return tuple(c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4 for c in channels)


MAT = {
    "chrome": material("Chrome", srgb("#c9ced4"), metallic=1.0, roughness=0.22),
    "steel": material("Steel", srgb("#8e959d"), metallic=1.0, roughness=0.45),
    "dark_steel": material("DarkSteel", srgb("#2b2f35"), metallic=0.6, roughness=0.5),
    "accent": material("Accent", srgb("#3fb950"), roughness=0.4),  # site accent green
    "wood": material("Wood", srgb("#b88a55"), roughness=0.7),
    "rubber": material("Rubber", srgb("#1d1f22"), roughness=0.9),
    "red": material("Plate25", srgb("#c8322b"), roughness=0.35),
    "blue": material("Plate20", srgb("#2a5db0"), roughness=0.35),
    "yellow": material("Plate15", srgb("#f2c230"), roughness=0.35),
    "green": material("Plate10", srgb("#2f8a4c"), roughness=0.35),
    "white": material("Plate5", srgb("#e9e7e2"), roughness=0.35),
    "black": material("Plate2_5", srgb("#26282b"), roughness=0.35),
}

parts = []


def cylinder_x(name, radius, length, x, mat, z=BAR_HEIGHT, bevel=0.0):
    """Cylinder lying along the X axis (the bar axis), centred at x."""
    bpy.ops.mesh.primitive_cylinder_add(vertices=SEGMENTS, radius=radius, depth=length, location=(x, 0, z))
    obj = bpy.context.active_object
    obj.name = name
    obj.rotation_euler = (0, math.radians(90), 0)
    obj.data.materials.append(mat)
    if bevel:
        mod = obj.modifiers.new("Bevel", "BEVEL")
        mod.width = bevel
        mod.segments = 1
        mod.limit_method = "ANGLE"
    bpy.ops.object.shade_auto_smooth()
    parts.append(obj)
    return obj


def box(name, size, location, mat, bevel=0.004):
    bpy.ops.mesh.primitive_cube_add(size=1, location=location)
    obj = bpy.context.active_object
    obj.name = name
    obj.scale = size
    obj.data.materials.append(mat)
    mod = obj.modifiers.new("Bevel", "BEVEL")
    mod.width = bevel
    mod.segments = 2
    parts.append(obj)
    return obj


# ---------- Bar ----------

SHAFT_LENGTH = 1.31
SLEEVE_LENGTH = 0.415
SHOULDER_THICKNESS = 0.03

cylinder_x("Shaft", 0.014, SHAFT_LENGTH, 0, MAT["chrome"])
for side in (-1, 1):
    shoulder_x = side * (SHAFT_LENGTH / 2 + SHOULDER_THICKNESS / 2)
    cylinder_x(f"Shoulder{side}", 0.038, SHOULDER_THICKNESS, shoulder_x, MAT["steel"], bevel=0.003)
    sleeve_x = side * (SHAFT_LENGTH / 2 + SHOULDER_THICKNESS + SLEEVE_LENGTH / 2)
    cylinder_x(f"Sleeve{side}", 0.025, SLEEVE_LENGTH, sleeve_x, MAT["chrome"])
    # Knurl marks: two thin dark rings on the shaft, like the real ring marks
    cylinder_x(f"RingMark{side}", 0.0142, 0.004, side * 0.405, MAT["dark_steel"])

# ---------- Plates (inside → out) ----------

PLATES = [
    # (name, diameter, thickness, material)
    ("25", 0.450, 0.027, "red"),
    ("20", 0.450, 0.022, "blue"),
    ("15", 0.400, 0.020, "yellow"),
    ("10", 0.325, 0.018, "green"),
    ("5", 0.230, 0.016, "white"),
    ("2.5", 0.190, 0.014, "black"),
]
GAP = 0.002

for side in (-1, 1):
    x = side * (SHAFT_LENGTH / 2 + SHOULDER_THICKNESS + GAP)
    for name, diameter, thickness, mat_key in PLATES:
        centre = x + side * thickness / 2
        radius = diameter / 2
        cylinder_x(f"Plate{name}_{side}", radius, thickness, centre, MAT[mat_key], bevel=0.003)
        # Raised outer lip and chrome hub give each plate a stepped profile instead of a flat disc
        cylinder_x(f"PlateLip{name}_{side}", radius * 0.97, thickness + 0.006, centre, MAT[mat_key], bevel=0.002)
        cylinder_x(f"PlateFace{name}_{side}", radius * 0.80, thickness + 0.002, centre, MAT[mat_key])
        cylinder_x(f"PlateHub{name}_{side}", 0.045, thickness + 0.008, centre, MAT["chrome"], bevel=0.002)
        x += side * (thickness + GAP)
    # Competition collar with a clamp knob
    collar_x = x + side * 0.035
    cylinder_x(f"Collar{side}", 0.04, 0.07, collar_x, MAT["steel"], bevel=0.004)
    box(f"CollarKnob{side}", (0.02, 0.02, 0.05), (collar_x, 0, BAR_HEIGHT + 0.055), MAT["accent"], bevel=0.003)

# ---------- Stands ----------

STAND_X = 0.42
for side in (-1, 1):
    sx = side * STAND_X
    box(f"StandBase{side}", (0.20, 0.26, 0.025), (sx, 0, 0.0125), MAT["dark_steel"])
    box(f"StandFoot{side}", (0.05, 0.30, 0.02), (sx, 0, 0.035), MAT["dark_steel"])
    post_height = BAR_HEIGHT - 0.03
    box(f"StandPost{side}", (0.05, 0.05, post_height), (sx, 0, post_height / 2 + 0.025), MAT["dark_steel"])
    # U-shaped cradle in the accent colour, the bar rests in it
    box(f"CradleBottom{side}", (0.06, 0.07, 0.012), (sx, 0, BAR_HEIGHT - 0.02), MAT["accent"])
    for wall in (-1, 1):
        box(f"CradleWall{side}{wall}", (0.06, 0.012, 0.05), (sx, wall * 0.03, BAR_HEIGHT), MAT["accent"])

# ---------- Platform (centre wood, rubber wings) ----------

PLATFORM_TOP = 0.0
box("PlatformWood", (1.10, 0.75, 0.04), (0, 0, PLATFORM_TOP - 0.02), MAT["wood"], bevel=0.006)
for side in (-1, 1):
    box(f"PlatformRubber{side}", (0.65, 0.75, 0.04), (side * 0.885, 0, PLATFORM_TOP - 0.02), MAT["rubber"], bevel=0.006)
    box(f"PlatformLine{side}", (0.012, 0.75, 0.002), (side * 0.554, 0, PLATFORM_TOP + 0.001), MAT["accent"], bevel=0.0)

# ---------- One mesh for the web ----------

for obj in parts:
    obj.select_set(True)
bpy.context.view_layer.objects.active = parts[0]
bpy.ops.object.convert(target="MESH")  # applies bevels
# Bake rotations/scales into the vertices first; otherwise the joined mesh inherits the shaft's 90° turn
bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
bpy.ops.object.join()
model = bpy.context.active_object
model.name = "Barbell"

# Centre the model on its bounding box so Three.js can orbit around the middle
bpy.ops.object.origin_set(type="ORIGIN_GEOMETRY", center="BOUNDS")
model.location = (0, 0, 0)

faces = len(model.data.polygons)
dims = model.dimensions
print(f"MODEL faces={faces} size={dims.x:.3f}x{dims.y:.3f}x{dims.z:.3f}m materials={len(model.data.materials)}")

bpy.ops.export_scene.gltf(
    filepath=GLB_OUT,
    export_format="GLB",
    use_selection=True,
    export_apply=True,
    export_yup=True,
    export_texcoords=False,
    export_normals=True,
    export_animations=False,
)
print(f"EXPORTED {GLB_OUT}")

# ---------- Phone fallback render ----------

engine_ids = [item.identifier for item in bpy.types.RenderSettings.bl_rna.properties["engine"].enum_items]
scene.render.engine = next((e for e in ("BLENDER_EEVEE_NEXT", "BLENDER_EEVEE") if e in engine_ids), engine_ids[0])
scene.render.film_transparent = True
scene.render.image_settings.file_format = "PNG"
scene.render.image_settings.color_mode = "RGBA"

world = bpy.data.worlds.new("World")
world.use_nodes = True
background = next(n for n in world.node_tree.nodes if n.type == "BACKGROUND")
background.inputs["Color"].default_value = (0.05, 0.055, 0.065, 1)
background.inputs["Strength"].default_value = 0.6
scene.world = world

sun = bpy.data.lights.new("Key", "SUN")
sun.energy = 3.2
sun.angle = math.radians(8)
sun_obj = bpy.data.objects.new("Key", sun)
sun_obj.rotation_euler = (math.radians(50), math.radians(10), math.radians(35))
scene.collection.objects.link(sun_obj)

fill = bpy.data.lights.new("Fill", "AREA")
fill.energy = 120
fill.size = 3
fill_obj = bpy.data.objects.new("Fill", fill)
fill_obj.location = (-2.0, -2.5, 1.6)
fill_obj.rotation_euler = (math.radians(60), 0, math.radians(-40))
scene.collection.objects.link(fill_obj)

# ---------- Camera: identical to the web viewer (js/hero-model.js) ----------
# The static image is shown until the live model takes over, so both must frame the model the same way.
# Keep these four values equal to FOV, VIEW_DIRECTION, FRAME_STRETCH and the 640/288 box in hero-model.js.
FOV = 28  # vertical, degrees, of the full (stretched) frame
VIEW_DIRECTION = (0.45, 0.32, 0.83)  # Three.js axes: x right, y up, z towards the viewer
FRAME_STRETCH = 1.3
BOX_ASPECT = 640 / 288

full_aspect = BOX_ASPECT / FRAME_STRETCH
vertical_half = math.radians(FOV) / 2
horizontal_half = math.atan(math.tan(vertical_half) * full_aspect)
radius = max(model.dimensions.x, model.dimensions.y) / 2  # bar length or platform depth
distance = radius * 1.08 / math.tan(min(vertical_half, horizontal_half))

camera_data = bpy.data.cameras.new("Camera")
camera_data.sensor_fit = "VERTICAL"
camera_data.angle_y = math.radians(FOV)
camera = bpy.data.objects.new("Camera", camera_data)
scene.collection.objects.link(camera)
scene.camera = camera
dx, dy, dz = VIEW_DIRECTION
length = math.sqrt(dx * dx + dy * dy + dz * dz)
# Three.js (x, y, z) → Blender (x, -z, y)
camera.location = Vector((dx, -dz, dy)) * (distance / length)
direction = Vector((0, 0, 0)) - camera.location
camera.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()
print(f"CAMERA distance={distance:.3f}")

# Render the full stretched frame; the web viewer shows only its bottom part (crop afterwards)
scene.render.resolution_x = 1120
scene.render.resolution_y = round(1120 / full_aspect)

scene.render.filepath = PNG_OUT
bpy.ops.render.render(write_still=True)
print(f"RENDERED {PNG_OUT} with {scene.render.engine}")
