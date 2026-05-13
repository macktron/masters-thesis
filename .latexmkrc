# =====================================================================
# .latexmkrc - latexmk configuration for the thesis.
#
# - Engine:        pdflatex + biber (biblatex IEEE style)
# - Output dir:    ./build  (also configurable per-IDE; see .vscode)
# - Final PDF:     copied to ./main.pdf after a successful build
# - Glossaries:    custom dependency runs makeglossaries inside the
#                  aux/out dir so the .acr file is found
# =====================================================================

$pdf_mode    = 1;
$pdflatex    = 'pdflatex -interaction=nonstopmode -synctex=1 -file-line-error %O %S';
$bibtex_use  = 2;
$biber       = 'biber %O %S';

# Keep .aux / .toc / etc. out of the source tree by default. This is
# overridden by `-outdir=...` from the command line (e.g. by LaTeX
# Workshop, which passes its own outdir), so terminal builds via the
# Makefile use ./build while IDE builds respect the IDE's setting.
$aux_dir = 'build';
$out_dir = 'build';

# ---- Glossaries-extra custom dependency -----------------------------
# When pdflatex emits build/main.acn, run makeglossaries from inside
# the build directory so it finds the .ist style file and writes
# build/main.acr next to the .acn. The path-aware shim handles both
# the (current) `build/main` and a plain `main` basename.
add_cus_dep('acn', 'acr', 0, 'run_makeglossaries');
add_cus_dep('glo', 'gls', 0, 'run_makeglossaries');

sub run_makeglossaries {
    my $base = $_[0];
    my $dir  = '.';
    if ( $base =~ m|^(.*)/([^/]+)$| ) {
        $dir  = $1;
        $base = $2;
    }
    my $cmd = "cd \"$dir\" && makeglossaries \"$base\"";
    print "Running: $cmd\n";
    return system($cmd);
}

# Extensions latexmk should also remove on `latexmk -c` / `-C`.
push @generated_exts, 'glo', 'gls', 'glg';
push @generated_exts, 'acn', 'acr', 'alg';
push @generated_exts, 'ist', 'synctex.gz', 'fls', 'fdb_latexmk';
push @generated_exts, 'bcf', 'run.xml';

# Copy the final PDF up to the project root after a successful build.
# %D is the build PDF path, %R is the document root name (e.g. main).
# Also sync the git remote (scripts/git-autopush.sh); failures never fail the build.
$success_cmd = 'cp %D %R.pdf; sh scripts/git-autopush.sh || true';
