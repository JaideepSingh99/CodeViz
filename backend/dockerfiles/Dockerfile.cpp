FROM gcc:latest
WORKDIR /app
COPY ./temp/temp.cpp /app/temp.cpp
RUN g++ temp.cpp -o temp.out
CMD ["./temp.out"]
