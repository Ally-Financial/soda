#!/usr/bin/env bash
case $1 in
    r*) cat $2                                                      ;; # Read file
    a*) echo -e $3 >> $2                                            ;; # Append to file, create if doesn't exist
    w*) echo -e $3 > $2                                             ;; # Write or overwrite file
    c*) echo -e $2 | pbcopy                                         ;; # Copy to clipboard
    d*) pwd                                                         ;; # Get current working directory
    o*) open -a Google\ Chrome $2 --args --disable-web-security     ;; # Open webpage
    s*) rm -f $2                                                       # Reset file
        touch $2                                                    ;; #
    p*) cd $2                                                       ;; # Change the current working directory
    i*) test -d $2 && echo 1 || echo 0                              ;; # Check if the path is in the cwd and is a directory
    f*) test -f $2 && echo 1 || echo 0                              ;; # Check if the path is in the cwd and is a file
    l*) ls -1 -i                                                    ;; # List directory contents without ../ & ./
    n*) echo "$(echo $3 | cat - $2)" > $2                           ;; # Prepend a line to a file
    m*) mv "$(echo -e $2)" "$(echo -e $3)"                          ;; # Move a file
    x*) say $2                                                      ;; # Dictation
esac
