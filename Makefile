all: server

server.key:
	openssl genrsa -out $@ 2048

server.csr: server.key
	openssl req -nodes -new -subj '/CN=localhost' -addext 'subjectAltName=DNS:localhost' -key $< -out $@

server.cer: server.csr server.key
	openssl x509 -signkey server.key -copy_extensions copy -ext subjectAltName -in $< -req -days 7 -out $@

server.pem: server.cer server.key
	cat $^ > $@

server: server.pem
	cd configurator; sudo openssl s_server -cert ../$< -port 443 -WWW

clean:
	-rm server.key server.csr server.cer server.pem
 
