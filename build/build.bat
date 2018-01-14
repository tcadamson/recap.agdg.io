cd ..
robocopy /e js build\node\working /xd lib
robocopy /e css build\node\working\transpiled
cd build\node
call npx babel working -d working\transpiled
cd ..
jjs -scripting r.js -- -o config.js
cd ..
robocopy js\lib build\output\js\lib
cd build/output
move js\*.css css
cd ..
rmdir /s /q node\working
pause