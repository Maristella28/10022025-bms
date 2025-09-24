<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\Profile;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Resident>
 */
class ResidentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array
     */
    public function definition()
    {
        return [
            'user_id' => User::factory(),
            'profile_id' => Profile::factory(),
            'resident_id' => $this->faker->unique()->numerify('RES-#####'),
            'first_name' => $this->faker->firstName(),
            'middle_name' => $this->faker->lastName(),
            'last_name' => $this->faker->lastName(),
            'name_suffix' => $this->faker->optional()->suffix(),
            'birth_date' => $this->faker->date(),
            'birth_place' => $this->faker->city(),
            'age' => $this->faker->numberBetween(18, 80),
            'nationality' => 'Filipino',
            'sex' => $this->faker->randomElement(['Male', 'Female']),
            'civil_status' => $this->faker->randomElement(['Single', 'Married', 'Widowed', 'Separated']),
            'religion' => $this->faker->randomElement(['Catholic', 'Protestant', 'Muslim', 'Other']),
            'relation_to_head' => $this->faker->randomElement(['Head', 'Spouse', 'Child', 'Parent']),
            'email' => $this->faker->unique()->safeEmail(),
            'mobile_number' => $this->faker->phoneNumber(),
            'current_address' => $this->faker->address(),
            'current_photo' => null,
            'years_in_barangay' => $this->faker->numberBetween(1, 30),
            'voter_status' => $this->faker->randomElement(['Registered', 'Not Registered']),
            'voters_id_number' => $this->faker->optional()->numerify('VOTER-#######'),
            'voting_location' => $this->faker->optional()->city(),
            'housing_type' => $this->faker->randomElement(['Owned', 'Rented', 'Family-owned']),
            'head_of_family' => $this->faker->boolean(30), // 30% chance of being head of family
            'household_no' => $this->faker->optional()->numerify('HH-####'),
            'classified_sector' => $this->faker->randomElement(['Formal', 'Informal', 'Unemployed', 'Student']),
            'educational_attainment' => $this->faker->randomElement(['Elementary', 'High School', 'College', 'Postgraduate']),
            'occupation_type' => $this->faker->randomElement(['Employed', 'Self-employed', 'Unemployed', 'Student']),
            'salary_income' => $this->faker->randomElement(['Below 10k', '10k-20k', '20k-50k', 'Above 50k']),
            'business_info' => $this->faker->optional()->company(),
            'business_type' => $this->faker->optional()->word(),
            'business_location' => $this->faker->optional()->city(),
            'business_outside_barangay' => $this->faker->boolean(20), // 20% chance business is outside barangay
            'special_categories' => json_encode($this->faker->randomElements(['PWD', 'Senior Citizen', 'Solo Parent', 'Indigenous'], $this->faker->numberBetween(0, 2))),
            'covid_vaccine_status' => $this->faker->randomElement(['Fully Vaccinated', 'Partially Vaccinated', 'Not Vaccinated']),
            'vaccine_received' => json_encode($this->faker->randomElements(['Pfizer', 'Moderna', 'AstraZeneca', 'Sinovac'], $this->faker->numberBetween(0, 3))),
            'other_vaccine' => $this->faker->optional()->word(),
            'year_vaccinated' => $this->faker->optional()->year(),
            'residency_verification_image' => null,
            'verification_status' => $this->faker->randomElement(['pending', 'approved', 'denied']),
            'denial_reason' => $this->faker->optional()->sentence(),
            'last_modified' => $this->faker->dateTimeBetween('-2 years', 'now'),
            'for_review' => $this->faker->boolean(20), // 20% chance of being flagged for review
        ];
    }
}
