# Push this code to TheRealZachre/video-clips

From any machine with GitHub access as TheRealZachre:

```bash
# Get this folder (pick one)

# A) Clone this handoff branch
git clone -b cursor/video-clips-handoff-d156 --single-branch https://github.com/TheRealZachre/youtube-seo-tool.git tmp-seo
cp -R tmp-seo/video-clips-handoff video-clips
cd video-clips

# B) Or download artifacts/video-clips-src.zip from this branch on GitHub, unzip, cd into it

# Then create a fresh git repo and push
rm -rf .git
git init -b main
git add .
git commit -m "Initial commit: Video Clips Opus-style MVP"
git remote add origin https://github.com/TheRealZachre/video-clips.git
git push -u origin main
```
