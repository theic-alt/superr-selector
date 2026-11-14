import os
import urllib.request

output_dir = r"C:\Users\sumed\.gemini\antigravity\scratch\superr-selector\frontend\public\players"
os.makedirs(output_dir, exist_ok=True)

players_images = {
    # Batters
    "donovan_ferreira": "https://www.rajasthanroyals.com/static-assets/images/players/23487.png",
    "shashank_singh": "https://www.punjabkingsipl.in/static-assets/images/players/63520.png",
    "ashutosh_sharma": "https://www.punjabkingsipl.in/static-assets/images/players/94786.png",
    "sikandar_raza": "https://upload.wikimedia.org/wikipedia/commons/2/2c/Sikandar_Raza_2022.jpg",
    "towhid_hridoy": "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/7a/Towhid_Hridoy.jpg/960px-Towhid_Hridoy.jpg",
    "tristan_stubbs": "https://www.delhicapitals.in/static-assets/images/players/ipl/74761.png",
    "david_miller": "https://upload.wikimedia.org/wikipedia/commons/f/f6/David_Miller_2025_interview_%28cropped%29.png",
    "naman_dhir": "https://www.mumbaiindians.com/static-assets/images/players/large/action-shots/100353.png",
    "rinku_singh": "https://www.kkr.in/static-assets/images/players/64727.png",
    "jason_holder": "https://upload.wikimedia.org/wikipedia/commons/d/de/Jason_Holder.jpg",
    
    # Bowlers
    "akeal_hosein": "https://images.icc-cricket.com/image/upload/t_player-headshot-portrait-lg-webp/prd/assets/players/generic/colored/57239.png",
    "mohammad_rishad_hossain": "https://upload.wikimedia.org/wikipedia/commons/8/84/Rishad_Hossain%2C_2025-02-08_Fortune_Barishal_BPL_2025_Champions_Trophy_Presentation_Dhaka_%28PID-0003668%29_%28cropped%29.jpg",
    "sunil_narine": "https://www.kkr.in/static-assets/images/players/11229.png",
    "eshan_malinga": "https://www.paarlroyals.com/static-assets/images/players/94784.png",
    "corbin_bosch": "https://www.rajasthanroyals.com/static-assets/waf-images/18/7b/e0/16-9/e86pfnohmivz26yxikx4n1stic4z9foo.jpg",
    "mitchell_santner": "https://www.mumbaiindians.com/static-assets/images/players/large/action-shots/57903.png",
    "jasprit_bumrah": "https://www.mumbaiindians.com/static-assets/images/players/large/action-shots/63755.png",
    "taskin_ahmed": "https://upload.wikimedia.org/wikipedia/commons/c/c7/2023-08-05_Prime_Minister_Sheikh_Hasina_presents_Sheikh_Kamal_National_Sports_Council_Award_%28PID-0014441%29_%28cropped%29.jpg",
    "roston_chase": "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/12/Roston_Chase_batting_at_Perth_Stadium%2C_First_Test_Australia_versus_West_Indies%2C_2_December_2022_09.jpg/960px-Roston_Chase_batting_at_Perth_Stadium%2C_First_Test_Australia_versus_West_Indies%2C_2_December_2022_09.jpg",
    "harshit_rana": "https://www.kkr.in/static-assets/images/players/93526.png"
}

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'}

for key, url in players_images.items():
    ext = ".jpg" if "jpg" in url.lower() else ".png"
    dest = os.path.join(output_dir, f"{key}{ext}")
    print(f"Downloading {key} -> {dest}...")
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=12) as response:
            content = response.read()
            with open(dest, "wb") as f:
                f.write(content)
            print(f"  OK: {len(content)} bytes")
    except Exception as e:
        print(f"  FAILED {key}: {e}")

print("Done downloading player images!")
