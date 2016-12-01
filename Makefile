ENV:=_env

.PHONEY: help
help:
	#

.PHONEY:
install:
	$(MAKE) install --directory server/

.PHONEY: test
test:
	#

.PHONY: cloc
cloc:
	cloc --exclude-dir=$(ENV),ext,libs,node_modules ./

.PHONEY: clean
clean:
	#
