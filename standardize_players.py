import os
import numpy as np
from PIL import Image, ImageEnhance, ImageFilter

BATTER_BASE_PATH = r"C:\Users\sumed\.gemini\antigravity\scratch\superr-selector\batsman_cutout.png"
BOWLER_BASE_PATH = r"C:\Users\sumed\.gemini\antigravity\scratch\superr-selector\test_antialiased.png"
RAW_PLAYERS_DIR = r"C:\Users\sumed\.gemini\antigravity\scratch\superr-selector\frontend\public\players"
OUT_DIR = r"C:\Users\sumed\.gemini\antigravity\scratch\superr-selector\frontend\public\players\standardized"
os.makedirs(OUT_DIR, exist_ok=True)

# 20 Official Players Spec
PLAYERS = [
    # TOP 10 BATTERS
    {"name": "Donovan Ferreira", "file": "donovan_ferreira", "role": "Batter", "team": "RR", "pri_color": (234, 26, 136), "sec_color": (10, 17, 40)},
    {"name": "Shashank Singh", "file": "shashank_singh", "role": "Batter", "team": "PBKS", "pri_color": (221, 31, 45), "sec_color": (210, 180, 100)},
    {"name": "Ashutosh Sharma", "file": "ashutosh_sharma", "role": "Batter", "team": "PBKS", "pri_color": (221, 31, 45), "sec_color": (210, 180, 100)},
    {"name": "Sikandar Raza", "file": "sikandar_raza", "role": "Batter", "team": "PBKS", "pri_color": (221, 31, 45), "sec_color": (210, 180, 100)},
    {"name": "Towhid Hridoy", "file": "towhid_hridoy", "role": "Batter", "team": "BAN", "pri_color": (0, 106, 78), "sec_color": (244, 42, 65)},
    {"name": "Tristan Stubbs", "file": "tristan_stubbs", "role": "Batter", "team": "DC", "pri_color": (0, 76, 151), "sec_color": (239, 51, 64)},
    {"name": "David Miller", "file": "david_miller", "role": "Batter", "team": "GT", "pri_color": (27, 33, 51), "sec_color": (209, 171, 62)},
    {"name": "Naman Dhir", "file": "naman_dhir", "role": "Batter", "team": "MI", "pri_color": (0, 75, 160), "sec_color": (209, 171, 62)},
    {"name": "Rinku Singh", "file": "rinku_singh", "role": "Batter", "team": "KKR", "pri_color": (58, 34, 93), "sec_color": (236, 197, 66)},
    {"name": "Jason Holder", "file": "jason_holder", "role": "Batter", "team": "WI", "pri_color": (123, 0, 65), "sec_color": (255, 199, 44)},

    # TOP 10 BOWLERS
    {"name": "Akeal Hosein", "file": "akeal_hosein", "role": "Bowler", "team": "WI", "pri_color": (123, 0, 65), "sec_color": (255, 199, 44)},
    {"name": "Mohammad Rishad Hossain", "file": "mohammad_rishad_hossain", "role": "Bowler", "team": "BAN", "pri_color": (0, 106, 78), "sec_color": (244, 42, 65)},
    {"name": "Sunil Narine", "file": "sunil_narine", "role": "Bowler", "team": "KKR", "pri_color": (58, 34, 93), "sec_color": (236, 197, 66)},
    {"name": "Eshan Malinga", "file": "eshan_malinga", "role": "Bowler", "team": "RR", "pri_color": (234, 26, 136), "sec_color": (10, 17, 40)},
    {"name": "Corbin Bosch", "file": "corbin_bosch", "role": "Bowler", "team": "RR", "pri_color": (234, 26, 136), "sec_color": (10, 17, 40)},
    {"name": "Mitchell Santner", "file": "mitchell_santner", "role": "Bowler", "team": "CSK", "pri_color": (249, 205, 5), "sec_color": (0, 81, 158)},
    {"name": "Jasprit Bumrah", "file": "jasprit_bumrah", "role": "Bowler", "team": "MI", "pri_color": (0, 75, 160), "sec_color": (209, 171, 62)},
    {"name": "Taskin Ahmed", "file": "taskin_ahmed", "role": "Bowler", "team": "BAN", "pri_color": (0, 106, 78), "sec_color": (244, 42, 65)},
    {"name": "Roston Chase", "file": "roston_chase", "role": "Bowler", "team": "WI", "pri_color": (123, 0, 65), "sec_color": (255, 199, 44)},
    {"name": "Harshit Rana", "file": "harshit_rana", "role": "Bowler", "team": "KKR", "pri_color": (58, 34, 93), "sec_color": (236, 197, 66)}
]

def load_face(file_prefix):
    # Try png or jpg
    p_png = os.path.join(RAW_PLAYERS_DIR, f"{file_prefix}.png")
    p_jpg = os.path.join(RAW_PLAYERS_DIR, f"{file_prefix}.jpg")
    p = p_png if os.path.exists(p_png) else p_jpg
    if not os.path.exists(p):
        return None
    im = Image.open(p).convert('RGBA')
    # If it was a photo with background, remove solid or crop top head
    w, h = im.size
    # Crop head portion (top 45% of image)
    head_box = (int(w * 0.15), 0, int(w * 0.85), int(h * 0.45))
    head = im.crop(head_box)
    
    # Create elliptical feather mask for face
    hw, hh = head.size
    mask = Image.new('L', (hw, hh), 0)
    import math
    from PIL import ImageDraw
    draw = ImageDraw.Draw(mask)
    # Ellipse covering face
    draw.ellipse([(int(hw * 0.1), int(hh * 0.05)), (int(hw * 0.9), int(hh * 0.95))], fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(radius=8))
    
    # If image already had alpha channel, combine with it
    if im.mode == 'RGBA':
        orig_alpha = head.split()[3]
        comb_arr = np.minimum(np.array(mask), np.array(orig_alpha))
        mask = Image.fromarray(comb_arr)
        
    head.putalpha(mask)
    return head

def tint_jersey(body_im, pri_color, role):
    arr = np.array(body_im, dtype=np.float32)
    h, w = arr.shape[:2]
    alpha = arr[:, :, 3]
    
    # Torso region:
    # Batter: Y from 280 to 650
    # Bowler: Y from 260 to 600
    y_start = 280 if role == 'Batter' else 260
    y_end = 650 if role == 'Batter' else 600
    
    # Target jersey area: non-transparent pixels in torso
    torso_mask = (alpha > 80)
    torso_mask[:y_start, :] = False
    torso_mask[y_end:, :] = False
    
    # Blend target color
    target_r, target_g, target_b = pri_color
    blend_strength = 0.55
    
    lum = (arr[torso_mask, 0] * 0.299 + arr[torso_mask, 1] * 0.587 + arr[torso_mask, 2] * 0.114) / 255.0
    arr[torso_mask, 0] = arr[torso_mask, 0] * (1 - blend_strength) + (target_r * lum) * blend_strength
    arr[torso_mask, 1] = arr[torso_mask, 1] * (1 - blend_strength) + (target_g * lum) * blend_strength
    arr[torso_mask, 2] = arr[torso_mask, 2] * (1 - blend_strength) + (target_b * lum) * blend_strength
    
    return Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8))

def add_studio_rim_lighting(im):
    # Left rim: RR Pink (234, 26, 136), Right rim: Cyan (6, 182, 212)
    arr = np.array(im, dtype=np.float32)
    alpha = arr[:, :, 3] / 255.0
    
    # Compute edge gradient using Sobel-like diff
    grad_x = np.zeros_like(alpha)
    grad_x[:, 1:-1] = (alpha[:, 2:] - alpha[:, :-2]) * 0.5
    
    left_edge = np.maximum(grad_x, 0)
    right_edge = np.maximum(-grad_x, 0)
    
    # Boost edges
    left_mask = (left_edge > 0.15)
    right_mask = (right_edge > 0.15)
    
    # Left rim tint (Pink)
    arr[left_mask, 0] = np.clip(arr[left_mask, 0] * 0.6 + 234 * 0.4, 0, 255)
    arr[left_mask, 1] = np.clip(arr[left_mask, 1] * 0.6 + 26 * 0.4, 0, 255)
    arr[left_mask, 2] = np.clip(arr[left_mask, 2] * 0.6 + 136 * 0.4, 0, 255)
    
    # Right rim tint (Cyan)
    arr[right_mask, 0] = np.clip(arr[right_mask, 0] * 0.6 + 6 * 0.4, 0, 255)
    arr[right_mask, 1] = np.clip(arr[right_mask, 1] * 0.6 + 182 * 0.4, 0, 255)
    arr[right_mask, 2] = np.clip(arr[right_mask, 2] * 0.6 + 212 * 0.4, 0, 255)
    
    return Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8))

def build_standardized_player(p_info):
    name = p_info["name"]
    role = p_info["role"]
    file_prefix = p_info["file"]
    pri_color = p_info["pri_color"]
    
    # 1. Load base body
    base_path = BATTER_BASE_PATH if role == "Batter" else BOWLER_BASE_PATH
    body = Image.open(base_path).convert('RGBA')
    
    # 2. Tint uniform with authentic team color
    body = tint_jersey(body, pri_color, role)
    
    # 3. Load & composite verified real face
    face = load_face(file_prefix)
    if face is not None:
        # Scale face to match head
        if role == "Batter":
            # Head target width ~ 170px, Y ~ 90-250
            face_w = 175
            face_h = int(face.size[1] * (face_w / face.size[0]))
            face_resized = face.resize((face_w, face_h), Image.Resampling.LANCZOS)
            # Composite onto head
            body.alpha_composite(face_resized, (380, 85))
        else:
            # Bowler target width ~ 140px, Y ~ 80-230
            face_w = 145
            face_h = int(face.size[1] * (face_w / face.size[0]))
            face_resized = face.resize((face_w, face_h), Image.Resampling.LANCZOS)
            body.alpha_composite(face_resized, (375, 75))
            
    # 4. Add subtle studio rim lighting
    body = add_studio_rim_lighting(body)
    
    # 5. Standardize on 1024x1536 canvas:
    # Crop tight bounding box
    alpha = np.array(body)[:, :, 3]
    coords = np.argwhere(alpha > 40)
    y_min, x_min = coords.min(axis=0)
    y_max, x_max = coords.max(axis=0)
    cropped = body.crop((x_min, y_min, x_max, y_max))
    
    # Target canvas
    CANVAS_W = 1024
    CANVAS_H = 1536
    canvas = Image.new('RGBA', (CANVAS_W, CANVAS_H), (0, 0, 0, 0))
    
    # Target character height: 88% of canvas = 1352px
    TARGET_H = 1352
    TARGET_FEET_Y = 1420 # Align feet at y=1420
    
    crop_w, crop_h = cropped.size
    scale = TARGET_H / float(crop_h)
    new_w = int(crop_w * scale)
    new_h = TARGET_H
    
    scaled = cropped.resize((new_w, new_h), Image.Resampling.LANCZOS)
    
    # Center horizontally, place feet at TARGET_FEET_Y
    pos_x = (CANVAS_W - new_w) // 2
    pos_y = TARGET_FEET_Y - new_h
    
    canvas.alpha_composite(scaled, (pos_x, pos_y))
    
    # Save standardized PNG
    out_path = os.path.join(OUT_DIR, f"{file_prefix}.png")
    canvas.save(out_path, format="PNG", optimize=True)
    print(f"Generated standardized: {file_prefix}.png (Size: 1024x1536, feet at Y={TARGET_FEET_Y})")

# Process all 20 players!
print(f"Starting standardization of {len(PLAYERS)} players...")
for p in PLAYERS:
    build_standardized_player(p)
print("ALL 20 PLAYERS STANDARDIZED SUCCESSFULLY!")
