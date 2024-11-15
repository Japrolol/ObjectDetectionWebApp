# Tensorflow Object Detection API -> https://www.tensorflow.org/hub/tutorials/object_detection
# Kod z dokumentacji przerobiony na moje potrzeby
import tensorflow as tf
import os
import tensorflow_hub as hub
from six.moves.urllib.request import urlopen
from six import BytesIO
import tempfile
import numpy as np
from PIL import Image, ImageColor, ImageDraw, ImageFont, ImageOps
import time

class Detector:
    def __init__(self, module_handle, progress_callback=None):
        self.detector = hub.load(module_handle).signatures['default']
        self.progress_callback = progress_callback

    def load_img(self, path):
        img = tf.io.read_file(path)
        img = tf.image.decode_jpeg(img, channels=3)
        return img

    def draw_bounding_box_on_image(self, image, ymin, xmin, ymax, xmax, color, font, thickness=4, display_str_list=()):
        draw = ImageDraw.Draw(image)
        im_width, im_height = image.size
        (left, right, top, bottom) = (xmin * im_width, xmax * im_width, ymin * im_height, ymax * im_height)
        draw.line([(left, top), (left, bottom), (right, bottom), (right, top), (left, top)], width=thickness, fill=color)

        display_str_heights = [font.getbbox(ds)[3] for ds in display_str_list]
        total_display_str_height = (1 + 2 * 0.05) * sum(display_str_heights)

        if top > total_display_str_height:
            text_bottom = top
        else:
            text_bottom = top + total_display_str_height

        for display_str in display_str_list[::-1]:
            bbox = font.getbbox(display_str)
            text_width, text_height = bbox[2], bbox[3]
            margin = np.ceil(0.05 * text_height)

            draw.rectangle((left, text_bottom - text_height - 2 * margin, left + text_width, text_bottom), fill=color)
            draw.text((left + margin, text_bottom - text_height - margin), display_str, fill="black", font=font)
            text_bottom -= text_height - 2 * margin

    def draw_boxes(self, image, boxes, class_names, scores, max_boxes=10, min_score=0.1):
        colors = list(ImageColor.colormap.values())
        font = ImageFont.load_default()
        filtered_scores, filtered_class_names = [], []
        for i in range(min(boxes.shape[0], max_boxes)):
            if scores[i] >= min_score:
                ymin, xmin, ymax, xmax = tuple(boxes[i])
                display_str = "{}: {}%".format(class_names[i].decode("ascii"), int(100 * scores[i]))
                color = "green"
                image_pil = Image.fromarray(np.uint8(image)).convert("RGB")
                self.draw_bounding_box_on_image(image_pil, ymin, xmin, ymax, xmax, color, font,
                                                display_str_list=[display_str])
                np.copyto(image, np.array(image_pil))
                filtered_scores.append(scores[i])
                filtered_class_names.append(class_names[i])
        return image, filtered_scores, [class_name.decode("ascii") for class_name in filtered_class_names]

    def download_and_resize_image(self, url, new_width=256, new_height=256, email=""):
        if not os.path.exists(f'Images/{email}/Before_Recognition'):
            os.makedirs(f'Images/{email}/Before_Recognition')

        _, filename = tempfile.mkstemp(suffix=".jpg")
        response = urlopen(url)
        image_data = response.read()
        image_data = BytesIO(image_data)

        pil_image = Image.open(image_data)
        pil_image = ImageOps.fit(pil_image, (new_width, new_height), Image.LANCZOS)
        pil_image_rgb = pil_image.convert("RGB")
        pil_image_rgb_save = pil_image_rgb.save(filename, format="JPEG", quality=90)

        before_recognition_path = os.path.join(f'Images/{email}/Before_Recognition', os.path.basename(filename))
        with open(before_recognition_path, "wb") as f:
            pil_image_rgb.save(before_recognition_path)

        if self.progress_callback:
            self.progress_callback(2)

        return filename, before_recognition_path

    def resize_existing_image(self, path, new_width=256, new_height=256, email=""):
        if not os.path.exists(f'Images/{email}/Before_Recognition'):
            os.makedirs(f'Images/{email}/Before_Recognition')
        path = os.path.join(f'Images/{email}/Before_Recognition', os.path.basename(path))
        pil_image = Image.open(path)
        pil_image = ImageOps.fit(pil_image, (new_width, new_height), Image.LANCZOS)
        pil_image_rgb = pil_image.convert("RGB")
        pil_image_rgb.save(path, format="JPEG", quality=90)

        return path

    def run_detector(self, path, before_recognition_path, email="", max_boxes=10):
        if not os.path.exists(f'Images/{email}/After_Recognition'):
            os.makedirs(f'Images/{email}/After_Recognition')

        img = self.load_img(path)
        converted_img = tf.image.convert_image_dtype(img, tf.float32)[tf.newaxis, ...]
        start_time = time.time()

        result = self.detector(converted_img)
        end_time = time.time()

        result = {key: value.numpy() for key, value in result.items()}

        if self.progress_callback:
            self.progress_callback(3)

        image_with_boxes, scores, names = self.draw_boxes(
            img.numpy(), result["detection_boxes"],
            result["detection_class_entities"], result["detection_scores"],
            max_boxes=max_boxes
        )

        after_recognition_path = os.path.join(f'Images/{email}/After_Recognition',
                                              "RECOGNIZED_" + os.path.basename(before_recognition_path))
        with open(after_recognition_path, "wb") as f:
            Image.fromarray(image_with_boxes).save(after_recognition_path)
            f.flush()
            os.fsync(f.fileno())

        return scores, names, os.path.basename(after_recognition_path)

    def run_with_online(self, image_url, email="", max_boxes=10):
        downloaded_image_path, before_recognition_path = self.download_and_resize_image(image_url, 1280, 856, email=email)
        scores, names, filename = self.run_detector(downloaded_image_path, before_recognition_path, email=email, max_boxes=max_boxes)
        filename = os.path.basename(filename).removeprefix("RECOGNIZED_")
        scores = [float(score) for score in scores]
        return {
            "scores": scores,
            "names": names,
            "filename": filename
        }

    def run_with_local(self, image_path, email="", max_boxes=10):
        resized_image_path = self.resize_existing_image(image_path, 1280, 856, email=email)
        scores, names, filename = self.run_detector(resized_image_path, resized_image_path, email=email, max_boxes=max_boxes)
        filename = os.path.basename(filename).removeprefix("RECOGNIZED_")
        scores = [float(score) for score in scores]

        return {
            "scores": scores,
            "names": names,
            "filename": filename
        }