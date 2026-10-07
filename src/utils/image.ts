import { File } from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';

const MAX_BYTES = 200 * 1024;

// Kareye kırpılmış fotoğrafı, 200 KB altına inene kadar kademeli olarak sıkıştırır.
export async function compressToUnder200KB(uri: string): Promise<string> {
  let size = 800;
  let quality = 0.8;
  let result = uri;

  for (let attempt = 0; attempt < 6; attempt++) {
    const manipulated = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: size, height: size } }],
      { compress: quality, format: ImageManipulator.SaveFormat.JPEG }
    );
    result = manipulated.uri;

    const fileSize = new File(result).size ?? Infinity;
    if (fileSize <= MAX_BYTES) {
      return result;
    }

    if (quality > 0.4) {
      quality -= 0.15;
    } else {
      size = Math.round(size * 0.75);
    }
  }

  return result;
}
