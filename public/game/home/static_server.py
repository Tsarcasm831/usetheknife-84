import http.server
import socketserver
import sys

class SafeHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    """
    Overrides SimpleHTTPRequestHandler to suppress ConnectionResetError when clients drop.
    """
    def log_message(self, format, *args):
        # Suppress standard logging of errors
        return

    def copyfile(self, source, outputfile):
        try:
            super().copyfile(source, outputfile)
        except ConnectionResetError:
            # Client closed connection mid-transfer; ignore
            pass


def main():
    port = 3057
    if len(sys.argv) > 1:
        try:
            port = int(sys.argv[1])
        except ValueError:
            print(f"Invalid port '{sys.argv[1]}', using default {port}")
    handler = SafeHTTPRequestHandler  # renamed from Handler to handler for snake_case lint
    with socketserver.TCPServer(("", port), handler) as httpd:
        print(f"Serving HTTP on port {port} (static content) ...")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("Server interrupted; shutting down.")
            httpd.server_close()

if __name__ == '__main__':
    main()
