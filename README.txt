Hello everyone,

the goal of this repository is to build a Debian Linux based NodeJS web server.
For this I have developed a framework that is as adaptable as possible, which works in its default configuration as a routing server and reads from the directory server_FILES/x.x.x/app. The configuration can be programmed in the server_FILES/x.x.x/main_x.x.x_x.mjs file.
The latest version supports the creation of multi-domain certificates and the server-side differentiation of host names.
This option is particularly useful for hosting subdomains with a CNAME entry (all requests to the same IP)
