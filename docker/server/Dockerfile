ARG BASE_IMAGE=node:20.11.1-slim

FROM $BASE_IMAGE
LABEL author="NGA"

ARG SERVER_VERSION=6.5.2
ARG ARC_VERSION=NONE
ARG SFTP_VERSION=NONE
ARG MSI_VERSION=NONE

USER root

RUN apt-get update

RUN groupadd -r mage \
    && useradd -m -r -s /bin/bash -g mage mage \
    && mkdir -p /var/lib/mage \
    && chown mage:mage /var/lib/mage

    USER mage
    ENV MAGE_HOME=/home/mage/instance
    WORKDIR ${MAGE_HOME}
    
    RUN set -eux; \
        ls -l; \
        npm i --omit=dev @ngageoint/mage.service@${SERVER_VERSION}; \
        npm i --omit=dev @ngageoint/mage.web-app@${SERVER_VERSION}; \
        \
        mkdir -p ./node_modules/@ngageoint; \
        ln -sfn mage.web-app ./node_modules/@ngageoint/web-app; \
        \
        if [ "$ARC_VERSION" != "NONE" ]; then \
          npm i --omit=dev --legacy-peer-deps @ngageoint/mage.arcgis.service@${ARC_VERSION} @ngageoint/mage.arcgis.web-app@${ARC_VERSION}; \
        fi; \
        if [ "$SFTP_VERSION" != "NONE" ]; then \
          npm i --omit=dev --legacy-peer-deps @ngageoint/mage.sftp.service@${SFTP_VERSION} @ngageoint/mage.sftp.web@${SFTP_VERSION}; \
        fi; \
        if [ "$MSI_VERSION" != "NONE" ]; then \
          npm i --omit=dev --legacy-peer-deps @ngageoint/mage.nga-msi@${MSI_VERSION}; \
        fi; \
        ln -sfn ./node_modules/.bin/mage.service ./mage.service; \
        test -f ./node_modules/@ngageoint/web-app/dist/admin/index.html
