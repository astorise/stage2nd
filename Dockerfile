# syntax=docker/dockerfile:1

# Stage 1: use Alpine to install required tools via apk
FROM alpine:latest AS tools
RUN apk add --no-cache bash curl iproute2 iputils

# Stage 2: build minimal image based on BusyBox
FROM busybox:latest
# Copy fstab for proper mount setup inside the container
COPY fstab /etc/fstab

# Copy essential tools from the Alpine stage
COPY --from=tools /bin/bash /bin/bash
COPY --from=tools /usr/bin/curl /usr/bin/curl
COPY --from=tools /sbin/ip /sbin/ip
COPY --from=tools /bin/ping /bin/ping
COPY --from=tools /lib /lib
COPY --from=tools /usr/lib /usr/lib

# Ensure bash is the default shell
CMD ["/bin/bash"]
