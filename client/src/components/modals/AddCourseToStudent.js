import React, { useEffect, useState } from "react";
import {
	Button,
	Form,
	FormCheck,
	Modal,
	Table,
} from "react-bootstrap";
import { fetchCourse } from "../../http/courseApi";

import { fetchAllUsers, addUserToCours } from "../../http/userApi";

const AddCourseToStudent = ({ show, onHide }) => {
	const [courses, setCourses] = useState([]);
	const [users, setUsers] = useState([]);
	const [selectedUsers, setSelectedUsers] = useState([]);
	const [sortColumn, setSortColumn] = useState("");
	const [sortOrder, setSortOrder] = useState("asc");
	const [searchTerm, setSearchTerm] = useState("");

	const [selectedCourseId, setSelectedCourseId] = useState("");

	useEffect(() => {
		if (show) {
			const fetchCourses = async () => {
				try {
					const data = await fetchCourse();
					setCourses(data);
				} catch (error) {
					console.error("Error fetching courses:", error);
				}
			};

			fetchCourses();
		}
	}, [show]);

	useEffect(() => {
		if (show) {
			const fetchUsers = async () => {
				try {
					const data = await fetchAllUsers();
					setUsers(data);
				} catch (error) {
					console.error("Error fetching Users:", error);
				}
			};

			fetchUsers();
		}
	}, [show]);

	const handleCourseChange = async (e) => {
		const courseId = e.target.value;
		setSelectedCourseId(courseId);
		try {
		} catch (error) {
			console.error("Error fetching paragraphs:", error);
		}
	};

	const handleUserSelect = (userId) => {
		setSelectedUsers((prevSelected) =>
			prevSelected.includes(userId)
				? prevSelected.filter((id) => id !== userId)
				: [...prevSelected, userId]
		);
	};

	const handelAddUsersToCourse = async () => {
		try {
			const courseUsers = {
				courseId: selectedCourseId,
				usersId: selectedUsers,
			};
			console.log(courseUsers);
			const data = await addUserToCours(courseUsers);
			console.log("User successfully add to course", data);
			setUsers([]);
			setCourses([])
			onHide();
		} catch (error) {
			console.error("Error add Users to course:", error);
		}
	};

	const handleSort = (column) => {
		const order = sortColumn === column && sortOrder === "asc" ? "desc" : "asc";
		setSortColumn(column);
		setSortOrder(order);
	};

	const sortedUsers = [...users].sort((a, b) => {
		if (a[sortColumn] < b[sortColumn]) return sortOrder === "asc" ? -1 : 1;
		if (a[sortColumn] > b[sortColumn]) return sortOrder === "asc" ? 1 : -1;
		return 0;
	});

	const filteredUsers = sortedUsers.filter((user) => {
		// Перевірка наявності курсу користувача
		const hasSelectedCourse = user.user_course?.basket_user_courses.some(
			(course) => course.courseId === parseInt(selectedCourseId)
		);

		// Фільтрування користувачів
		const matchesSearchTerm =
			user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			user.surname.toLowerCase().includes(searchTerm.toLowerCase()) ||
			user.group.toLowerCase().includes(searchTerm.toLowerCase()) ||
			user.email.toLowerCase().includes(searchTerm.toLowerCase());

		return !hasSelectedCourse && matchesSearchTerm;
	});

	return (
		<Modal
			show={show}
			onHide={onHide}
			size="lg"
			aria-labelledby="contained-modal-title-vcenter"
			centered
		>
			<Modal.Header closeButton>
				<Modal.Title id="contained-modal-title-vcenter">
				Додати студентів до курсу
				</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<Form>
					<Form.Group controlId="formCourseSelect">
						<Form.Label>Виберіть курс</Form.Label>
						<Form.Control
							as="select"
							value={selectedCourseId}
							onChange={handleCourseChange}
						>
							<option value="" disabled>
								Виберіть курс
							</option>
							{courses.map((course) => (
								<option key={course.id} value={course.id}>
									{course.title}
								</option>
							))}
						</Form.Control>
					</Form.Group>{" "}
					{selectedCourseId && (
						<>
							<Form.Group controlId="formSearch">
								<Form.Label>Пошук учнів</Form.Label>
								<Form.Control
									type="text"
									placeholder="Search by name, surname, group, or email"
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
								/>
							</Form.Group>
							<Table striped bordered hover className="mt-4">
								<thead>
									<tr>
										<th>Вибрати</th>
										<th onClick={() => handleSort("group")}>
											Група{" "}
											{sortColumn === "group" &&
												(sortOrder === "asc" ? "↑" : "↓")}
										</th>
										<th onClick={() => handleSort("name")}>
											Ім'я{" "}
											{sortColumn === "name" &&
												(sortOrder === "asc" ? "↑" : "↓")}
										</th>
										<th onClick={() => handleSort("surname")}>
											Прізвище{" "}
											{sortColumn === "surname" &&
												(sortOrder === "asc" ? "↑" : "↓")}
										</th>
										<th onClick={() => handleSort("email")}>
											Електронна пошта{" "}
											{sortColumn === "email" &&
												(sortOrder === "asc" ? "↑" : "↓")}
										</th>
									</tr>
								</thead>
								<tbody>
									{filteredUsers.map((user) => (
										<tr key={user.id}>
											<td>
												<FormCheck
													type="checkbox"
													checked={selectedUsers.includes(user.id)}
													onChange={() => handleUserSelect(user.id)}
												/>
											</td>
											<td>{user.group}</td>
											<td>{user.name}</td>
											<td>{user.surname}</td>
											<td>{user.email}</td>
										</tr>
									))}
								</tbody>
							</Table>
						</>
					)}
				</Form>
			</Modal.Body>
			<Modal.Footer>
				<Button variant="outline-danger" onClick={onHide}>
					Закрити
				</Button>
				<Button variant="outline-success" onClick={handelAddUsersToCourse}>
					Додати
				</Button>
			</Modal.Footer>
		</Modal>
	);
};

export default AddCourseToStudent;
