import re
import sys

def main():
    content = None

    with open(sys.argv[1]) as f:
        content = f.read()

    replaced = re.sub('!\[(.+?)\]\((.+?)\)', '{% asset_img \g<2> \g<1> %}', content)
    print(replaced)

if __name__ == '__main__':
    main()
