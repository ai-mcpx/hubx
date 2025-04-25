FROM ubuntu:22.04

USER root
ENV DEBIAN_FRONTEND=noninteractive
ENV TIME_ZONE=Asia/Shanghai
RUN apt update -y && \
    apt install -y apt-transport-https ca-certificates curl && \
    apt install -y inetutils-ping net-tools openssh-server perl telnet tzdata vim && \
    ln -snf /usr/share/zoneinfo/$TIME_ZONE /etc/localtime && echo $TIME_ZONE > /etc/timezone && \
    echo "dash dash/sh boolean false" | debconf-set-selections && \
    DEBIAN_FRONTEND=noninteractive dpkg-reconfigure dash
RUN apt install -y build-essential python3 python3-pip ruby-full zlib1g-dev && \
    gem install jekyll bundler && \
    curl -LsSf https://astral.sh/uv/install.sh | sh

RUN mkdir /hubx
COPY . /hubx/

USER root
WORKDIR /hubx
ENV PATH=/root/.local/bin:$PATH
RUN uv sync --group dev && \
    python3 -m pip install jsonschema requests && \
    mkdir -p pages/registry && \
    mkdir -p pages/api/servers && \
    chmod +x ./scripts/prepare.sh && \
    ./scripts/prepare.sh ./pages

USER root
WORKDIR /hubx/pages
CMD ["jekyll", "serve", "--host", "127.0.0.1", "--port", "8080"]
