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

# The universal TeX Live biber fails to self-extract with Xcode 27's lipo
# ("extracting arm64 binary with lipo failed"). Prefer a pre-thinned copy
# (lipo /Library/TeX/texbin/biber -thin arm64 -output ~/.local/bin/biber).
my $thin_biber = "$ENV{HOME}/.local/bin/biber";
$biber = "\"$thin_biber\" %O %S" if -x $thin_biber;

# Keep .aux / .toc / etc. out of the source tree by default. This is
# overridden by `-outdir=...` from the command line (e.g. by LaTeX
# Workshop, which passes its own outdir), so terminal builds via the
# Makefile use ./build while IDE builds respect the IDE's setting.
$aux_dir = 'build';
$out_dir = 'build';

# ---- KTH front cover (XeLaTeX, Arial) -------------------------------
# frontmatter/cover/cover.tex needs XeLaTeX for Arial, so it is built
# here, before the pdflatex run, whenever it or its inputs are newer
# than build/cover/cover.pdf. kth-style.tex includes the result.
{
    my $cover_pdf = 'build/cover/cover.pdf';
    my @cover_src = ('frontmatter/cover/cover.tex', 'thesis-metadata.tex',
                     'figures/kth/KTH_logo_RGB_bla.png');
    my $pdf_mtime = -e $cover_pdf ? (stat $cover_pdf)[9] : 0;
    if ( grep { -e $_ && (stat $_)[9] > $pdf_mtime } @cover_src ) {
        mkdir 'build';
        mkdir 'build/cover';
        print "Building KTH cover: $cover_pdf\n";
        system('xelatex -interaction=nonstopmode -halt-on-error '
             . '-output-directory=build/cover frontmatter/cover/cover.tex '
             . '> build/cover/xelatex-stdout.log 2>&1') == 0
            or warn "KTH cover build failed; see build/cover/cover.log\n";
    }
}

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
