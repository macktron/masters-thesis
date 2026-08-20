# =====================================================================
# Makefile - thin wrapper around latexmk for the KTH thesis build.
#
# Targets:
#   make            full build (latexmk -pdf main.tex, runs biber)
#   make watch      continuous rebuild on save (latexmk -pvc)
#   make clean      remove auxiliary files but keep main.pdf
#   make distclean  remove the build/ tree and main.pdf
#   make section S=04_method
#                   build only sections/04_method/method.tex (subfile)
# =====================================================================

MAIN      := main
LATEXMK   := latexmk
S         ?= 01_introduction
SECTION_NAME := $(shell echo '$(S)' | sed 's/^[0-9][0-9]*_//')

.PHONY: all watch clean distclean section help

all:
	$(LATEXMK) -pdf $(MAIN).tex

watch:
	$(LATEXMK) -pdf -pvc $(MAIN).tex

clean:
	$(LATEXMK) -c

distclean:
	$(LATEXMK) -C
	rm -rf build
	rm -f $(MAIN).pdf

section:
	$(LATEXMK) -pdf -cd "sections/$(S)/$(SECTION_NAME).tex"

help:
	@echo "make              full thesis build -> main.pdf"
	@echo "make watch        rebuild on save"
	@echo "make clean        remove aux files, keep main.pdf"
	@echo "make distclean    remove build/ and main.pdf"
	@echo "make section S=04_method   compile one chapter wrapper"
