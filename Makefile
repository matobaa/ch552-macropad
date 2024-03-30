all: server

server.key:
	openssl genrsa -out $@ 2048

server.csr: server.key
	openssl req -new -batch -key $< -out $@

server.cer: server.csr server.key
	openssl x509 -signkey server.key -in $< -req -days 365 -out $@

server.pem: server.cer server.key
	cat $^ > $@

server: server.pem
	cd configurator; sudo openssl s_server -cert ../$< -port 443 -WWW

clean:
	-rm server.key server.csr server.cer server.pem
 
