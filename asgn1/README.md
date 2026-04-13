
Hello >:3  

// known bugs: 
//  - pong score does not reset unless page is reloaded 
//  - pong paddles/dot colors are set to last used color from painting tools 
//    or blue if last used button is 'Drawing' 
//  - IMPORTANT: You may run into an issue where the right pong paddle does  
//    not appear when clicking 'run pong;' this is usually fixed by clicking 
//    exit pong -> clear -> play pong if that does not work, reload the page 
//    and try again. I have tried in vain to fix this. We just have to accept 
//    that Patty (the bot / right paddle) needs a break sometimes like the rest of us 

// other notes: 
//  - the pong bot is beatable! There is no win condition, but the bot is intentionally 
//    imperfect to make scoring points possible 
//  - ball speed increases after each paddle hit, capped 
//    as ~3x speed 
//  - IMPORTANT: My drawing does contain the letters 'KH' as required, 
//    they are located on the right-most sparkles, and are a solid yellow 
//    instead of a gradient, as the other sparkles are (the 'K' is rotated 
//    slightly counter-clockwise)