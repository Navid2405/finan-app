package com.finanapp;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(properties = {
		"jwt.secret=ClavEdealmenos32CaracTeresJwSecReT"
})
class FinanappBackendApplicationTests {




	@Test
	void contextLoads() {
	}

}
