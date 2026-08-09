def count_people(results):

    people_count = 0

    for box in results[0].boxes:

        if int(box.cls[0]) == 0:
            people_count += 1

    return people_count
def get_person_boxes(results):

    person_boxes = []

    for box in results[0].boxes:

        if int(box.cls[0]) == 0:

            person_boxes.append(box)

    return person_boxes
def calculate_density(frame, people_count):

    height, width = frame.shape[:2]

    area = width * height

    density = people_count / area

    return density
def create_metrics(frame, results):

    people_count = count_people(results)

    density = calculate_density(frame, people_count)

    return {
        "people_count": people_count,
        "density": density
    }