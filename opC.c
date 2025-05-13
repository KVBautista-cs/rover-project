#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define BUFFER_SIZE 1024

int main(int argc, char *argv[]) {
    char buffer[BUFFER_SIZE];

    // Case 1: No arguments - echo stdin to stdout
    if (argc == 1) {
        while (fgets(buffer, sizeof(buffer), stdin)) {
            fputs(buffer, stdout);
        }
    }
    // Case 2: -o output.txt - write stdin to output file
    else if (argc == 3 && strcmp(argv[1], "-o") == 0) {
        FILE *outfile = fopen(argv[2], "w");
        if (!outfile) {
            perror("Could not open output file");
            return 1;
        }

        while (fgets(buffer, sizeof(buffer), stdin)) {
            fputs(buffer, outfile);
        }

        fclose(outfile);
    }
    // Case 3: input.txt output.txt - transfer contents of input file(s) to output file
    else if (argc >= 3) {
        FILE *outfile = fopen(argv[argc - 1], "a");
        if (!outfile) {
            perror("Could not open output file");
            return 1;
        }

        for (int i = 1; i < argc - 1; i++) {
            FILE *infile = fopen(argv[i], "r");
            if (!infile) {
                perror(argv[i]);
                continue;
            }

            int totalBytes = 0;
            size_t bytesRead;
            while ((bytesRead = fread(buffer, 1, BUFFER_SIZE, infile)) > 0) {
                fwrite(buffer, 1, bytesRead, outfile);
                totalBytes += bytesRead;
            }

            printf("%d bytes transferred from file %s to file %s\n",
                   totalBytes, argv[i], argv[argc - 1]);

            fclose(infile);
        }

        fclose(outfile);
    }
    else {
        fprintf(stderr, "Invalid usage.\n");
        return 1;
    }

    return 0;
}
