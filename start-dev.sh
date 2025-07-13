#!/bin/bash

# Open terminal for frontend
x-terminal-emulator -e bash -c "
cd frontend;
echo '[Frontend] Installing dependencies...';
npm install;
echo '[Frontend] Starting dev server...';
npm run dev;
exec bash
" &

# Open terminal for backend
x-terminal-emulator -e bash -c "
cd backend;
echo '[Backend] Installing dependencies...';
npm install;
echo '[Backend] Starting backend server...';
npm start;
exec bash
" &
