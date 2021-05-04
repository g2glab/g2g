FROM alpine:3.13

RUN apk add --no-cache npm openjdk11-jre-headless

ENV PG_VERSION 0.3.5
RUN cd /opt \
 && wget https://github.com/g2glab/pg/archive/refs/tags/v${PG_VERSION}.zip \
 && unzip v${PG_VERSION}.zip && rm v${PG_VERSION}.zip \
 && cd /opt/pg-${PG_VERSION} \
 && npm install && npm link

ENV JENA_VERSION 3.17.0
RUN cd /opt \
 && wget http://archive.apache.org/dist/jena/binaries/apache-jena-${JENA_VERSION}.zip \
 && unzip apache-jena-${JENA_VERSION}.zip && rm apache-jena-${JENA_VERSION}.zip
ENV PATH $PATH:/opt/apache-jena-${JENA_VERSION}/bin

ENV G2G_VERSION 0.3.8
RUN cd /opt \
 && wget https://github.com/g2glab/g2g/archive/refs/tags/v${G2G_VERSION}.zip \
 && unzip v${G2G_VERSION}.zip && rm v${G2G_VERSION}.zip \
 && cd /opt/g2g-${G2G_VERSION} \
 && npm install && npm link

WORKDIR /work
